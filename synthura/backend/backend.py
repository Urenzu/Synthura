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

#----------------------------------------------------------------------------------------------------#

"""
Backend environment setup:

1. python -m venv synthura
2. synthura\Scripts\activate (In base backend directory)
3. pip install opencv-python ultralytics fastapi uvicorn aiortc av websockets torch
4. To run: uvicorn backend:app --reload
5. Enter url: http://<ip>:<port>/video

"""

#----------------------------------------------------------------------------------------------------#

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

#----------------------------------------------------------------------------------------------------#

class SynthuraSecuritySystem:
    def __init__(self, model_path='yolov8n.pt'):
        self.model = self.load_model(model_path)
        self.camera_connections = {}
        self.camera_urls = []
        self.detected_objects = {}
        self.motion_status = {}

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

    def add_camera(self, camera_id, camera_url, websocket, pc):
        if camera_url in self.camera_urls:
            logger.warning(f"Camera {camera_url} is already added.")
            return
        self.camera_connections[camera_id] = [camera_url, websocket, pc]
        self.camera_urls.append(camera_url)
        self.detected_objects[camera_id] = []
        self.motion_status[camera_id] = []

        logger.info(f"Camera {camera_url} added successfully.")

    def object_detection(self, frame):
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
        self.camera_connections.pop(camera_id)
        self.detected_objects.pop(camera_id)

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
                    
                    pc = RTCPeerConnection()

                    self.add_camera(camera_id, decoded_camera_url, websocket, pc)

                    cap = cv2.VideoCapture(decoded_camera_url)
                    track = MyVideoStreamTrack(cap, self, camera_id)
                    pc.addTrack(track)

                    offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    await websocket.send_text(pc.localDescription.sdp)

                else:
                    logging.info("Received Answer")
                    await pc.setRemoteDescription(RTCSessionDescription(type="answer", sdp=json_data["sdp"]))

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

Width x Height sizes: 320x240, 416x416, 480x360, 640x480, 800x600, 1024x768, 1920x1080
"""
class MyVideoStreamTrack(VideoStreamTrack):
    def __init__(self, cap, security_system, camera_id, frame_width=1920, frame_height=1080, buffer_size=1):
        super().__init__()
        self.cap = cap
        self.security_system = security_system
        self.camera_id = camera_id
        self.resize_width = frame_width
        self.resize_height = frame_height
        self.frame_buffer = Queue(maxsize=buffer_size)
        self.capture_thread = Thread(target=self.capture_frames)
        self.capture_thread.daemon = True
        self.capture_thread.start()

        # Motion detection attributes #
        self.background = None
        self.background = None
        self.frame_count = 0
        self.background_update_interval = 50

    def capture_frames(self):
        while True:
            ret, frame = self.cap.read()
            if ret:
                resized_frame = cv2.resize(frame, (self.resize_width, self.resize_height))
                if not self.frame_buffer.full():
                    self.frame_buffer.put(resized_frame)

    async def recv(self):
        if not self.frame_buffer.empty():
            frame = self.frame_buffer.get()
            annotated_frame = await self.process_frame(frame)

            pts, time_base = await self.next_timestamp()
            finished_frame = VideoFrame.from_ndarray(annotated_frame, format="bgr24")
            finished_frame.pts = pts
            finished_frame.time_base = time_base
            return finished_frame
        else:
            empty_frame = numpy.zeros((self.resize_height, self.resize_width, 3), dtype=numpy.uint8)
            pts, time_base = await self.next_timestamp()
            empty_frame = VideoFrame.from_ndarray(empty_frame, format="bgr24")
            empty_frame.pts = pts
            empty_frame.time_base = time_base
            return empty_frame

    async def process_frame(self, frame):
        results = await asyncio.to_thread(self.security_system.object_detection, frame)
        annotated_frame = await asyncio.to_thread(self.security_system.frame_annotation, results)

        detected_objects = [str(self.security_system.model.names[int(obj.cls)]) for obj in results[0].boxes]
        self.security_system.detected_objects[self.camera_id] = detected_objects

        motion_detected = await asyncio.to_thread(self.detect_motion, frame)

        if motion_detected:
            if 'motion' not in self.security_system.motion_status[self.camera_id]:
                self.security_system.motion_status[self.camera_id].append('motion')
        else:
            if 'motion' in self.security_system.motion_status[self.camera_id]:
                self.security_system.motion_status[self.camera_id].remove('motion')

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
