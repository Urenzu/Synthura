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

"""
Backend environment setup (2 approaches):

Python virtual environment approach (Current):
python -m venv synthura
synthura\Scripts\activate (In base synthura directory)
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

class SynthuraSecuritySystem:
    def __init__(self, model_path='yolov8n.pt'):
        self.model = self.load_model(model_path)
        self.camera_tasks = {}
        self.camera_ips = []
        self.camera_results = {}

    def load_model(self, model_path):
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

    def add_camera(self, camera_ip):
        if camera_ip in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is already added.")
            return

        stop_event = Event()
        task = asyncio.create_task(self.camera_processing(camera_ip, stop_event))
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

    async def handle_websocket(self, websocket: WebSocket, camera_ip: str):
        decoded_camera_ip = unquote(camera_ip)
        await websocket.accept()
        self.add_camera(decoded_camera_ip)

        while True:
            try:
                offer = await websocket.receive_text()
                offer = RTCSessionDescription(sdp=offer, type='offer')

                pc = RTCPeerConnection()
                video_transform_track = VideoTransformTrack(decoded_camera_ip, self)
                pc.addTrack(video_transform_track)

                await pc.setRemoteDescription(offer)
                answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)

                await websocket.send_text(pc.localDescription.sdp)

                while True:
                    message = await websocket.receive_text()

            except WebSocketDisconnect:
                self.remove_camera(decoded_camera_ip)
                break

security_system = SynthuraSecuritySystem()

@app.websocket("/api/video_feed/{camera_ip}/ws")
async def video_feed_websocket(websocket: WebSocket, camera_ip: str):
    decoded_camera_ip = unquote(camera_ip)
    await security_system.handle_websocket(websocket, decoded_camera_ip)

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
