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
pip install opencv-python ultralytics fastapi uvicorn aiortc av websockets
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    expose_headers=["Content-Disposition"],
)

class SynthuraSecuritySystem:
    def __init__(self, model_path='yolov8n.pt'):
        self.model = self.load_model(model_path)
        self.camera_ips = []
        self.camera_peer_connections = {}

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

    def add_camera(self, camera_ip):

        if camera_ip in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is already added.")
            return
        self.camera_ips.append(camera_ip)
        logger.info(f"Camera {camera_ip} added successfully.")

    def object_detection(self, frame):
        return self.model(frame)

    def frame_annotation(self, results):
        return results[0].plot()

    def remove_camera(self, camera_ip):
        if camera_ip not in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is not found.")
            return

        self.camera_ips.remove(camera_ip)

        logger.info(f"Camera {camera_ip} removed successfully.")

    def stop(self):
        for camera_ip in list(self.camera_tasks.keys()):
            self.stop_camera_processing(camera_ip)
        
        cv2.destroyAllWindows()
        logger.info("Security system stopped.")

    # TODO: Store PeerConnection objects for each camera
    async def handle_websocket(self, websocket: WebSocket):

        await websocket.accept()
        pc = None
        decoded_camera_ip = ""

        while True:
            data = await websocket.receive_text()
            try:
                json_data = json.loads(data)
                type = json_data.get("type")

                # add camera to security and create/send offer
                if type == "camera_url":
                    # retrieve camera ip and add to security system
                    camera_ip = json_data.get("camera_ip")
                    camera_id = json_data.get("camera_id")
                    decoded_camera_ip = unquote(camera_ip)


                    # TODO: Tweak add_camera to process video from link
                    #self.add_camera(camera_id, decoded_camera_ip)
                    
                    # Initiate webrtc connection
                    pc = RTCPeerConnection()
                    self.camera_peer_connections[camera_id] = pc

                    # Add video track to peer connection
                    cap = cv2.VideoCapture(decoded_camera_ip)
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
                await self.camera_peer_connections[camera_id].close()
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
            # results = self.security_system.object_detection(frame)
            # annotated_frame = self.security_system.frame_annotation(results)
            pts, time_base = await self.next_timestamp()
            finished_frame = VideoFrame.from_ndarray(frame, format="bgr24")
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
    print("test")
    await security_system.handle_websocket(websocket)

@app.post("/api/add_camera")
async def add_camera(camera_ip: CameraIP):
    security_system.add_camera(camera_ip.camera_ip)
    return {"message": "Camera added successfully"}

@app.post("/api/remove_camera")
async def remove_camera(camera_ip: CameraIP):
    security_system.remove_camera(camera_ip.camera_ip)
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
