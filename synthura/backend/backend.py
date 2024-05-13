import cv2
from ultralytics import YOLO
from threading import Event
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
from fastapi.middleware.cors import CORSMiddleware

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

        # data stored as "camera_id: [camera_url, pc, websocket]"
        self.camera_connections = {}
        self.camera_urls = []

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

    def add_camera(self, camera_id, camera_url, websocket, pc):

        if camera_url in self.camera_urls:
            logger.warning(f"Camera {camera_url} is already added.")
            return
        self.camera_connections[camera_id] = [camera_url, websocket, pc]
        self.camera_urls.append(camera_url)
        logger.info(f"Camera {camera_url} added successfully.")

    def object_detection(self, frame):
        return self.ov_model(frame)

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
    def __init__(self, cap, security_system):
        super().__init__()  # Initialize parent class
        self.cap = cap
        self.security_system = security_system

    async def recv(self):
        ret, frame = self.cap.read()
        if ret:
            results = self.security_system.object_detection(frame)
            annotated_frame = self.security_system.frame_annotation(results)
            pts, time_base = await self.next_timestamp()
            finished_frame = VideoFrame.from_ndarray(annotated_frame, format="bgr24")
            finished_frame.pts = pts
            finished_frame.time_base = time_base
            return finished_frame
        else:
            # Create an empty frame with dimensions matching the camera's output to send something back
            empty_frame = numpy.zeros((480, 640, 3), dtype=numpy.uint8)  # Assuming (480, 640) resolution and BGR24 format
            pts, time_base = await self.next_timestamp()
            empty_frame = VideoFrame.from_ndarray(empty_frame, format="bgr24")
            empty_frame.pts = pts
            empty_frame.time_base = time_base
            return empty_frame

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
