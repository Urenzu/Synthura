from fastapi import FastAPI, Body, Query
from backend import SynthuraSecuritySystem
from pydantic import BaseModel

app = FastAPI()
security_system = SynthuraSecuritySystem()

class CameraID(BaseModel):
    camera_id: int

@app.post("/add_camera")
async def add_camera(camera_id: CameraID):
    security_system.add_camera(camera_id.camera_id)
    return {"message": "Camera added successfully"}

@app.post("/remove_camera")
async def remove_camera(camera_id: CameraID):
    security_system.remove_camera(camera_id.camera_id)
    return {"message": "Camera removed successfully"}

@app.get("/get_camera_results")
async def get_camera_results(camera_id: int = Query(...)):
    results = security_system.get_camera_results(camera_id)
    return {"results": results}