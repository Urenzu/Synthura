import cv2
from ultralytics import YOLO
from threading import Thread, Event
import os
from fastapi import FastAPI, Body, Query, HTTPException
from pydantic import BaseModel
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription
import logging

"""
Backend environment setup

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
        """
        Initialize the Synthura Security System.
        
        Args:
            model_path (str): Path to the YOLOv8 model file.
        """
        self.model = self.load_model(model_path)
        self.camera_threads = []
        self.camera_results = {}
        self.camera_ips = []

    def load_model(self, model_path):
        """
        Load the YOLOv8 model.
        
        Args:
            model_path (str): Path to the YOLOv8 model file.
        
        Returns:
            model (YOLO): Loaded YOLOv8 model.
        """
        model_path = os.path.join(os.path.dirname(__file__), model_path)
        return YOLO(model_path)

    def add_camera(self, camera_ip):
        """
        Add a new camera to the security system.
        
        Args:
            camera_ip (str): IP address of the camera.
        """
        
        if camera_ip in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is already added.")
            return

        stop_event = Event()
        asyncio.create_task(self.camera_processing(camera_ip, stop_event))
        self.camera_threads.append(stop_event)
        self.camera_ips.append(camera_ip)
        logger.info(f"Camera {camera_ip} added successfully.")

    async def camera_processing(self, camera_ip, stop_event):
        """
        Process the camera feed and perform object detection.
        
        Args:
            camera_ip (str): IP address of the camera.
            stop_event (Event): Event to signal the thread to stop.
        """
        try:
            # Create a new RTCPeerConnection
            pc = RTCPeerConnection()

            # Create an offer and set the local description
            offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            # Set the remote description with the camera IP
            await pc.setRemoteDescription(RTCSessionDescription(
                sdp=f"v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nc=IN IP4 {camera_ip}\r\nt=0 0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\na=rtpmap:96 H264/90000\r\na=fmtp:96 packetization-mode=1\r\n",
                type='offer'
            ))

            # Start receiving video frames
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
                
                self.display_frame(camera_ip, annotated_frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            # Close the peer connection
            await pc.close()
            cv2.destroyAllWindows()
            logger.info(f"Camera {camera_ip} processing stopped.")

        except Exception as e:
            logger.error(f"Error processing camera {camera_ip}: {str(e)}")

    def stop_camera_processing(self, camera_ip):
        """
        Stop the camera processing for a specific camera.
        
        Args:
            camera_ip (str): IP address of the camera to stop.
        """
        for thread in self.camera_threads:
            if thread.name == camera_ip:
                thread._stop_event.set()
                break

    def object_detection(self, frame):
        """
        Perform object detection on a frame using the YOLOv8 model.
        
        Args:
            frame (numpy.ndarray): Input frame.
        
        Returns:
            results (list): List of detected objects.
        """
        return self.model(frame)

    def frame_annotation(self, frame, results):
        """
        Annotate the frame with detected objects.
        
        Args:
            frame (numpy.ndarray): Input frame.
            results (list): List of detected objects.
        
        Returns:
            annotated_frame (numpy.ndarray): Annotated frame.
        """
        return results[0].plot()

    def display_frame(self, camera_ip, frame):
        """
        Display the frame in a window.
        
        Args:
            camera_ip (str): IP address of the camera.
            frame (numpy.ndarray): Frame to be displayed.
        """
        cv2.imshow(f"Camera {camera_ip}", frame)

    def get_camera_results(self, camera_ip):
        """
        Get the object detection results for a specific camera.
        
        Args:
            camera_ip (str): IP address of the camera.
        
        Returns:
            results (list): List of object detection results for the specified camera.
        """
        results = self.camera_results.get(camera_ip)
        if results is None:
            logger.warning(f"No results found for camera {camera_ip}")
        return results

    def add_camera_ips(self, camera_ips):
        """
        Add camera IP addresses to the security system.
        
        Args:
            camera_ips (list): List of camera IP addresses.
        """
        for camera_ip in camera_ips:
            self.add_camera(camera_ip)

    def remove_camera(self, camera_ip):
        """
        Remove a camera from the security system.
        
        Args:
            camera_ip (str): IP address of the camera to remove.
        """

        if camera_ip not in self.camera_ips:
            logger.warning(f"Camera {camera_ip} is not found.")
            return

        self.camera_ips.remove(camera_ip)
        
        # Stop the camera thread
        self.stop_camera_processing(camera_ip)
        for thread in self.camera_threads:
            if thread.name == camera_ip:
                thread.join()
                self.camera_threads.remove(thread)
                break
        
        # Remove the camera from the results dictionary
        if camera_ip in self.camera_results:
            del self.camera_results[camera_ip]

        logger.info(f"Camera {camera_ip} removed successfully.")

    def stop(self):
        """
        Stop the security system and release resources.
        """
        for thread in self.camera_threads:
            thread._stop_event.set()
            thread.join()
        
        cv2.destroyAllWindows()
        logger.info("Security system stopped.")

security_system = SynthuraSecuritySystem()

class CameraIP(BaseModel):
    camera_ip: str

@app.post("/api/add_camera")
async def add_camera(camera_ip: CameraIP):
    asyncio.create_task(security_system.camera_processing(camera_ip.camera_ip, Event()))
    return {"message": "Camera added successfully"}

@app.post("/api/remove_camera")
async def remove_camera(camera_ip: CameraIP):
    security_system.remove_camera(camera_ip.camera_ip)
    return {"message": "Camera removed successfully"}

@app.get("/api/get_camera_urls")
async def get_camera_urls():
    camera_urls = security_system.camera_ips
    return {"camera_urls": camera_urls}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
