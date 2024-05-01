from pydantic import BaseModel
from aiortc import VideoStreamTrack
from av import VideoFrame

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