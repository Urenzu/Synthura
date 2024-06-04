import cv2
from ultralytics import YOLO
from threading import Event, Thread
from queue import Queue
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
import logging
from av import VideoFrame
from urllib.parse import unquote
from pydantic import BaseModel
from aiortc import VideoStreamTrack
import numpy
import json
import torch
import time
from fastapi.middleware.cors import CORSMiddleware

#----------------------------------------------------------------------------------------------------#

"""
Backend environment setup:

1. python -m venv synthura
2. synthura\Scripts\activate (In base backend directory)
3. pip install opencv-python ultralytics fastapi uvicorn aiortc av websockets torch
4. To run: uvicorn backend:app --reload
5. Enter url: http://<ip>:<port>/video

Cuda environment setup:
1. cmd: nvidia-smi
2. Check what cuda version you would need to install (Right side).
3. Install: Correct CUDA Toolkit. (Example Toolkit: https://developer.nvidia.com/cuda-downloads)
4. Install: Correct torch version for your CUDA Toolkit within virtual environment from the website: https://pytorch.org/get-started/locally/ (Make sure to 'pip unistall torch torchvision torchaudio' first)
Example command for synthura virtual environment: pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
"""

#----------------------------------------------------------------------------------------------------#

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

#----------------------------------------------------------------------------------------------------#

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

class SynthuraSecuritySystem:
    def __init__(self, model_path='yolov8n.pt', frame_width=640, frame_height=480):
        self.model = self.load_model(model_path)
        self.camera_connections = {}
        self.camera_urls = []
        self.detected_objects = {}
        self.motion_status = {}
        self.frame_width = frame_width
        self.frame_height = frame_height

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        model = YOLO(model_path)
        if torch.cuda.is_available():
            model = model.cuda()

        print(f"Cuda available: {torch.cuda.is_available()}")
        print(f"Cuda version: {torch.version.cuda}")
        print(f"Model loaded on device: {model.device}")
        return model

    def add_camera(self, camera_id, camera_url, websocket, pc, cap):
        if camera_url in self.camera_urls:
            logger.warning(f"Camera {camera_url} is already added.")
            return
        self.camera_connections[camera_id] = [camera_url, websocket, pc, cap]
        self.camera_urls.append(camera_url)
        self.detected_objects[camera_id] = []
        self.motion_status[camera_id] = "no motion"
        logger.info(f"Camera {camera_url} added successfully.")

    def object_detection(self, frame):
        if torch.cuda.is_available():
            frame = torch.from_numpy(frame)
            frame = frame.permute(2, 0, 1).unsqueeze(0).float()
            frame /= 255.0

            height, width = frame.shape[2], frame.shape[3]
            new_height = (height // 32) * 32
            new_width = (width // 32) * 32
            frame = torch.nn.functional.interpolate(frame, size=(new_height, new_width), mode='bilinear', align_corners=False)
            
            frame = frame.cuda()
            
            return self.model(frame)
        else:
            return self.model(frame)

    def frame_annotation(self, results):
        return results[0].plot()

    async def remove_camera(self, camera_id):
        logger.info(self.camera_connections)

        if camera_id not in list(self.camera_connections.keys()):
            logger.warning(f"Camera {camera_id} is not found.")
            return
        
        self.camera_urls.remove(self.camera_connections[camera_id][0])
        await self.camera_connections[camera_id][1].close(1000)
        await self.camera_connections[camera_id][2].close()
        self.camera_connections[camera_id][3].stop()
        self.camera_connections.pop(camera_id)
        self.detected_objects.pop(camera_id)
        self.motion_status.pop(camera_id)
        logger.info(f"Camera {camera_id} removed successfully.")

    def stop(self):
        for camera_id in list(self.camera_connections.keys()):
            self.remove_camera(camera_id)
        cv2.destroyAllWindows()
        logger.info("Security system stopped.")

#----------------------------------------------------------------------------------------------------#

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

                if type == "camera_info":

                    camera_url = json_data.get("camera_url")
                    camera_id = json_data.get("camera_id")
                    decoded_camera_url = unquote(camera_url)

                    print(decoded_camera_url)
                    
                    pc = RTCPeerConnection()

                    # Attempt to capture video from url, retry up to 10 times if failed
                    attempts = 0
                    cap = None
                    while attempts < 10:
                        cap = cv2.VideoCapture(decoded_camera_url)
                        if cap.isOpened():
                            logger.info(f"Successfully opened video capture for camera ID: {camera_id} on attempt {attempts + 1}")
                            break
                        else:
                            logger.info(f"Failed to open video capture for camera ID: {camera_id} on attempt {attempts + 1}")
                            attempts += 1
                            time.sleep(0.1)

                    if not cap or not cap.isOpened():
                        logger.info(f"All attempts to open video capture failed for camera ID: {camera_id}")
                        return None
                    
                    track = MyVideoStreamTrack(cap, self, camera_id)
                    pc.addTrack(track)

                    self.add_camera(camera_id, decoded_camera_url, websocket, pc, track)

                    offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    await websocket.send_json({
                        "type": "offer",
                        "sdp": pc.localDescription.sdp
                    })

                    logger.info(f"sent offer")
                
                elif type == "analytics":
            
                    detected_objects = self.detected_objects.get(camera_id)
                    await websocket.send_json({
                        "type": "analytics",
                        "detected_objects": detected_objects,
                        "motion_status": self.motion_status.get(camera_id)
                    })

                else:
                    logging.info("Received Answer")
                    await pc.setRemoteDescription(RTCSessionDescription(type="answer", sdp=json_data["sdp"]))
                
                logger.info(self.camera_connections)

            except WebSocketDisconnect:
                logging.info("Websocket disconnected")
                break

#----------------------------------------------------------------------------------------------------#
"""
Buffer sizes: 1, 3, 5, 10, 20, 30, 40, 50
Explanation: 
Smaller buffer sizes reduce latency between capturing frames and processing them. This results in lower camera delay.
Although if the buffer is too small it may lead to dropped frames since the processing cannot kepp up with the frame capture rate.

Larger buffer sizes will increase latency between capturing frames and processing them resulting in higher camera delay.
However larger buffer sizes can help smooth out any temporary processing delays leading to more stable streams and a reduction in the likelihood of dropped frames.
"""
class MyVideoStreamTrack(VideoStreamTrack):
    def __init__(self, cap, security_system, camera_id, buffer_size=1):
        super().__init__()
        self.cap = cap
        self.security_system = security_system
        self.camera_id = camera_id
        self.resize_width = security_system.frame_width
        self.resize_height = security_system.frame_height
        self.frame_buffer = Queue(maxsize=buffer_size)
        self.capture_thread = Thread(target=self.capture_frames)
        self.capture_thread.daemon = True
        self.running = True
        self.capture_thread.start()
        self.last_annotated_frame = None

        # Motion detection attributes #
        self.background = None
        self.background = None
        self.frame_count = 0
        self.background_update_interval = 50

    def capture_frames(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                logger.info(f"Camera {self.camera_id} frame captured")
                resized_frame = cv2.resize(frame, (self.resize_width, self.resize_height))
                if not self.frame_buffer.full():
                    self.frame_buffer.put(resized_frame)
                else:
                    continue
            else:
                logger.warning(f"Camera {self.camera_id} frame not captured")
                time.sleep(0.01)
    
    def stop(self):
        self.running = False
        self.capture_thread.join()
        self.cap.release()

    async def recv(self):
        if not self.frame_buffer.empty():
            frame = self.frame_buffer.get()
            annotated_frame = await self.process_frame(frame)
            self.last_annotated_frame = annotated_frame
        else:
            if self.last_annotated_frame is not None:
                annotated_frame = self.last_annotated_frame
            else:
                logger.info("No frames available")
                annotated_frame = numpy.zeros((self.resize_height, self.resize_width, 3), dtype=numpy.uint8)

        pts, time_base = await self.next_timestamp()
        finished_frame = VideoFrame.from_ndarray(annotated_frame, format="bgr24")
        finished_frame.pts = pts
        finished_frame.time_base = time_base
        return finished_frame

    async def process_frame(self, frame):

        # loop = asyncio.get_event_loop()

        # results = await loop.run_in_executor(None, self.security_system.object_detection, frame)
        # annotated_frame = await loop.run_in_executor(None, self.security_system.frame_annotation, results)
        
        results = await asyncio.to_thread(self.security_system.object_detection, frame)
        annotated_frame = await asyncio.to_thread(self.security_system.frame_annotation, results)

        detected_objects = [str(self.security_system.model.names[int(obj.cls)]) for obj in results[0].boxes]
        self.security_system.detected_objects[self.camera_id] = detected_objects
        motion_detected = await asyncio.to_thread(self.detect_motion, frame)

        # motion_detected = await loop.run_in_executor(None, self.detect_motion, frame)

        if motion_detected:
            self.security_system.motion_status[self.camera_id] = "motion"
        else:
            self.security_system.motion_status[self.camera_id] = "no motion"

        logger.info(f"Camera {self.camera_id} detected objects: {self.security_system.detected_objects[self.camera_id]}")
        logger.info(f"Camera {self.camera_id} motion status: {self.security_system.motion_status[self.camera_id]}")

        return annotated_frame
    
    """
    Background subtraction motion detection implementation.
    """
    def detect_motion(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized_gray = cv2.resize(gray, (self.resize_width // 2, self.resize_height // 2))
        blurred = cv2.GaussianBlur(resized_gray, (5, 5), 0)

        if self.frame_count % self.background_update_interval == 0:
            self.background = blurred.copy()

        frame_delta = cv2.absdiff(self.background, blurred)

        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        min_area = (self.resize_width // 2) * (self.resize_height // 2) * 0.005
        significant_contours = [c for c in contours if cv2.contourArea(c) > min_area]

        if len(significant_contours) > 0:
            self.frame_count += 1
            return True
        else:
            self.frame_count += 1
            return False

#----------------------------------------------------------------------------------------------------#

security_system = SynthuraSecuritySystem()

class CameraIP(BaseModel):
    camera_ip: str

#----------------------------------------------------------------------------------------------------#

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
