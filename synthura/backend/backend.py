import cv2
from ultralytics import YOLO
from openvino.runtime import Core
from threading import Event
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
import logging
from av import VideoFrame
from urllib.parse import unquote
import json
import torch
import numpy

#----------------------------------------------------------------------------------------------------#

"""
Backend environment setup (2 approaches):

Python virtual environment approach (Current):
python -m venv synthura
synthura\Scripts\activate (In base backend directory)
pip install opencv-python ultralytics fastapi uvicorn aiortc av websockets openvino-dev
To run: uvicorn backend:app --reload

Anaconda approach (Outdated):
For python backend.py (command)
1. conda create --name synthura python=3.9
2. conda activate synthura
3. pip install ultralytics
4. pip install fastapi
5. pip install uvicorn
6. pip install aiortc

To run: uvicorn backend:app --reload
"""

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Allow all origins, methods, and headers (not recommended for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SynthuraSecuritySystem:
    def __init__(self, model_path='yolov8n.pt'):
        self.model = self.load_model(model_path)

        # Convert YOLOv8 model to OpenVINO format
        self.model.export(format='openvino')
        self.ov_model = self.load_model('yolov8n_openvino_model/')
        self.ov_model_path = os.path.join(os.path.dirname(__file__), 'yolov8n_openvino_model', 'yolov8n.xml')

        # Initialize the OpenVINO Runtime
        self.ie = Core()
        
        # Load the YOLOv8 network model in IR format from the specified XML file
        self.net = self.ie.read_model(model=self.ov_model_path)
        
        # Load the network model onto the CPU device for inference
        self.exec_net = self.ie.compile_model(model=self.net, device_name="GPU")
        
        # Create an inference request object to handle the execution of the model inference
        self.infer_request = self.exec_net.create_infer_request()

        # Get the input tensor name
        self.input_tensor_name = self.exec_net.inputs[0].get_any_name()

        # Get the output tensor name
        self.output_tensor = self.exec_net.outputs[0]

        # data stored as "camera_id: [camera_url, pc, websocket]"
        self.camera_connections = {}
        self.camera_urls = []

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        model = YOLO(model_path)
        # Load the model onto the GPU if available
        if torch.cuda.is_available():
            model = model.cuda()

        print(f"Cuda available: {torch.cuda.is_available()}")
        print(f"Cuda version: {torch.version.cuda}")
        print(f"Model loaded on device: {model.device}")
        return model

    def add_camera(self, camera_id, camera_url, websocket, pc):

        if camera_url in self.camera_urls:
            logger.warning(f"Camera {camera_url} is already added.")
            return
        self.camera_connections[camera_id] = [camera_url, websocket, pc]
        self.camera_urls.append(camera_url)
        logger.info(f"Camera {camera_url} added successfully.")

    def object_detection(self, frame):
        frame = torch.from_numpy(frame)
        
        # Convert frame to float32 and add batch dimension
        frame = frame.permute(2, 0, 1).unsqueeze(0).float()  # Convert HWC to CHW and add batch dimension
        
        # Normalize the frame
        frame /= 255.0

        # Resize frame to dimensions divisible by 32
        height, width = frame.shape[2], frame.shape[3]
        new_height = (height // 32) * 32
        new_width = (width // 32) * 32
        frame = torch.nn.functional.interpolate(frame, size=(new_height, new_width), mode='bilinear', align_corners=False)
        
        # Move frame to GPU if available
        if torch.cuda.is_available():
            frame = frame.cuda()
        
        return self.model(frame)

        # Convert the frame from HWC to CHW format
        chw_frame = resized_frame.transpose(2, 0, 1)

        # Add batch dimension and normalize the image
        input_blob = np.expand_dims(chw_frame, axis=0).astype(np.float32) / 255.0

        return input_blob
    
    def postprocess_results(self, results):
        # Convert results to a list of tuples (x_min, y_min, x_max, y_max, confidence)
        processed_results = []
        for detection in results[0]:
            x_center, y_center, width, height, confidence = detection[:5]
            
            # Convert normalized coordinates to absolute pixel values
            x_center = int(x_center * 640)
            y_center = int(y_center * 640)
            width = int(width * 640)
            height = int(height * 640)

            # Calculate bounding box coordinates
            x_min = int((x_center - width / 2) / 640 * self.original_frame_size[0])
            x_max = int((x_center + width / 2) / 640 * self.original_frame_size[0])
            y_min = int((y_center - height / 2) / 640 * self.original_frame_size[1])
            y_max = int((y_center + height / 2) / 640 * self.original_frame_size[1])

            processed_results.append((x_min, y_min, x_max, y_max, float(confidence)))
        return processed_results

    def object_detection(self, frame):
        preprocessed_frame = self.preprocess_frame(frame)

        # Start asynchronous inference
        self.infer_request.start_async(inputs={self.input_tensor_name: preprocessed_frame})
        
        # Wait for the inference result
        self.infer_request.wait()
        
        # Get the results from the inference request
        results = self.infer_request.get_tensor(self.output_tensor).data

        return self.postprocess_results(results)

    def frame_annotation(self, frame, results):
        # Post-process and annotate the frame with the results
        for result in results:
            # Assuming result contains bounding box coordinates and confidence score
            x_min, y_min, x_max, y_max, confidence = result
            
            label = f"Confidence: {confidence:.2f}"
            
            # Draw bounding box
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            
            # Draw label
            cv2.putText(frame, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        return frame

    async def remove_camera(self, camera_id):

        logger.info(self.camera_connections)

        if camera_id not in list(self.camera_connections.keys()):
            logger.warning(f"Camera {camera_id} is not found.")
            return

        self.camera_urls.remove(self.camera_connections[camera_id][0])
        await self.camera_connections[camera_id][1].close(1000)
        await self.camera_connections[camera_id][2].close()
        self.camera_connections.pop(camera_id)

        logger.info(f"Camera {camera_id} removed successfully.")

    def stop(self):
        for camera_id in list(self.camera_connections.keys()):
            self.remove_camera(camera_id)
        cv2.destroyAllWindows()
        logger.info("Security system stopped.")

    async def handle_websocket(self, websocket: WebSocket):

        await websocket.accept()
        pc = None
        decoded_camera_url = ""
        camera_id = None

        while True:

            try:
                
                data = await websocket.receive_text()
                json_data = json.loads(data)
                type = json_data.get("type")

                # add camera to security and create/send offer
                if type == "camera_info":
                    # retrieve camera ip and add to security system
                    camera_url = json_data.get("camera_url")
                    camera_id = json_data.get("camera_id")
                    decoded_camera_url = unquote(camera_url)
                    
                    # Initiate webrtc connection
                    pc = RTCPeerConnection()

                    self.add_camera(camera_id, decoded_camera_url, websocket, pc)

                    # Add video track to peer connection
                    cap = cv2.VideoCapture(decoded_camera_url)
                    track = MyVideoStreamTrack(cap, self)
                    pc.addTrack(track)

                    # Generate and send offer to client
                    offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    await websocket.send_text(pc.localDescription.sdp)

                # process answer from client
                else:
                    logging.info("Received Answer")
                    # set remote description to answer
                    await pc.setRemoteDescription(RTCSessionDescription(type="answer", sdp=json_data["sdp"]))

            except WebSocketDisconnect:
                logging.info("Websocket disconnected")
                break

# temp class to test video streaming
class MyVideoStreamTrack(VideoStreamTrack):
    def __init__(self, cap, security_system, camera_id, frame_width=1920, frame_height=1080, buffer_size=10):
        super().__init__()
        self.cap = cap
        self.security_system = security_system

    async def recv(self):
        ret, frame = self.cap.read()
        if ret:
            results = self.security_system.object_detection(frame)
            annotated_frame = self.security_system.frame_annotation(frame, results)
            pts, time_base = await self.next_timestamp()
            finished_frame = VideoFrame.from_ndarray(annotated_frame, format="bgr24")
            finished_frame.pts = pts
            finished_frame.time_base = time_base
            return finished_frame
        else:
            # Create an empty frame with dimensions matching the camera's output to send something back
            empty_frame = np.zeros((480, 640, 3), dtype=np.uint8)  # Assuming (480, 640) resolution and BGR24 format
            pts, time_base = await self.next_timestamp()
            empty_frame = VideoFrame.from_ndarray(empty_frame, format="bgr24")
            empty_frame.pts = pts
            empty_frame.time_base = time_base
            return empty_frame
    
    async def process_frame(self, frame):
        # if torch.cuda.is_available():
        #     frame = torch.from_numpy(frame).cuda()
        results = await asyncio.to_thread(self.security_system.object_detection, frame)
        annotated_frame = await asyncio.to_thread(self.security_system.frame_annotation, results)

        detected_objects = [str(self.security_system.model.names[int(obj.cls)]) for obj in results[0].boxes]
        self.security_system.detected_objects[self.camera_id] = detected_objects

        logger.info(f"Camera {self.camera_id} detected objects: {self.security_system.detected_objects[self.camera_id]}")

        return annotated_frame

#----------------------------------------------------------------------------------------------------#

security_system = SynthuraSecuritySystem()

class CameraIP(BaseModel):
    camera_ip: str

@app.websocket("/api/video_feed/ws")
async def video_feed_websocket(websocket: WebSocket):
    await security_system.handle_websocket(websocket)
 
@app.get("/api/remove_camera/{camera_id}")
async def remove_camera(camera_id: int):
    await security_system.remove_camera(camera_id)
    return {"message": "Camera removed successfully"}

@app.get("/api/get_camera_urls")
async def get_camera_urls():
    camera_urls = security_system.camera_ips
    return {"camera_urls": camera_urls}

@app.get("/api/get_camera_results")
async def get_camera_results(camera_ip: str):
    results = security_system.get_camera_results(camera_ip)
    return {"results": results}

@app.post("/api/stop_system")
async def stop_system():
    security_system.stop()
    return {"message": "Security system stopped successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
