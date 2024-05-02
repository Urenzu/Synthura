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
import httpx
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
        self.camera_tasks = {}
        self.camera_ips = []
        self.camera_results = {}

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

    def add_camera(self, camera_ip, camera_url):

        if camera_ip in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is already added.")
            return

        stop_event = Event()
        task = asyncio.create_task(self.camera_processing(camera_ip, stop_event, camera_url))
        self.camera_tasks[camera_ip] = (task, stop_event)
        self.camera_ips.append(camera_ip)
        logger.info(f"Camera {camera_ip} added successfully.")


    async def camera_processing(self, camera_ip, stop_event):
        try:
            pc = RTCPeerConnection()

            video_track = None
            @pc.on('track')
            def on_track(track):
                nonlocal video_track
                if track.kind == 'video':
                    video_track = track

            while not stop_event.is_set():
                if video_track is None:
                    await asyncio.sleep(0.1)
                    continue

                frame = await video_track.recv()
                img = cv2.imdecode(frame.data, cv2.IMREAD_COLOR)

                results = self.object_detection(img)
                annotated_frame = self.frame_annotation(img, results)
                
                self.camera_results[camera_ip] = results
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            await pc.close()
            cv2.destroyAllWindows()
            logger.info(f"Camera {camera_ip} processing stopped.")

        except Exception as e:
            logger.error(f"Error processing camera {camera_ip}: {str(e)}")

    def stop_camera_processing(self, camera_ip):
        if camera_ip in self.camera_tasks:
            task, stop_event = self.camera_tasks[camera_ip]
            stop_event.set()
            task.cancel()
            del self.camera_tasks[camera_ip]
            logger.info(f"Camera {camera_ip} processing stopped.")
        else:
            logger.warning(f"Camera {camera_ip} is not found.")

    def object_detection(self, frame):
        return self.model(frame)

    def frame_annotation(self, frame, results):
        return results[0].plot()

    def get_camera_results(self, camera_ip):
        results = self.camera_results.get(camera_ip)
        if results is None:
            logger.warning(f"No results found for camera {camera_ip}")
        return results

    def add_camera_ips(self, camera_ips):
        for camera_ip in camera_ips:
            self.add_camera(camera_ip)

    def remove_camera(self, camera_ip):
        if camera_ip not in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is not found.")
            return

        self.camera_ips.remove(camera_ip)
        self.stop_camera_processing(camera_ip)
        
        if camera_ip in self.camera_results:
            del self.camera_results[camera_ip]

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
                    decoded_camera_ip = unquote(camera_ip)
                    camera_id = json_data.get("camera_id")

                    logger.info(decoded_camera_ip)

                    # TODO: Tweak add_camera to process video from link
                    #self.add_camera(camera_id, decoded_camera_ip)
                    
                    # Initiate webrtc connection
                    pc = RTCPeerConnection()

                    # Add video track to peer connection
                    cap = cv2.VideoCapture(decoded_camera_ip)
                    track = MyVideoStreamTrack(cap)
                    pc.addTrack(track)

                    # TODO: Tweak add_camera to process video from link 
                    # video_transform_track = VideoTransformTrack(decoded_camera_ip, self)

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
                await pc.close()
                break

# temp class to test video streaming
class MyVideoStreamTrack(VideoStreamTrack):
    def __init__(self, cap):
        super().__init__()  # Initialize parent class
        self.cap = cap

    async def recv(self):
        while True:
            ret, frame = self.cap.read()
            if ret:
                pts, time_base = await self.next_timestamp()
                frame = VideoFrame.from_ndarray(frame, format="bgr24")
                frame.pts = pts
                frame.time_base = time_base
                return frame
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

class VideoTransformTrack(VideoStreamTrack):
    def __init__(self, camera_ip, security_system):
        super().__init__()
        self.camera_ip = camera_ip
        self.security_system = security_system

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        results = self.security_system.get_camera_results(self.camera_ip)

        if results is not None:
            annotated_frame = self.security_system.frame_annotation(results.orig_img, results)
            frame = VideoFrame.from_ndarray(annotated_frame, format="bgr24")
            frame.pts = pts
            frame.time_base = time_base
            return frame
        else:
            return None

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
