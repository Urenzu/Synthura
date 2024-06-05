# Synthura

## Setup Instructions

### Get Local Host Running

**Webpage Setup:**
1. `cd synthura`
2. `npm install`
3. `npm run dev`

**Server Setup:**
1. `cd synthura`
2. `cd backend`
3. `python -m venv synthura`
4. `synthura\Scripts\activate` (Run this in the base backend directory)
5. `pip install opencv-python ultralytics fastapi uvicorn aiortc av websockets torch`
6. `pip install -q git+https://github.com/THU-MIG/yolov10.git`
7. To run server: `uvicorn backend:app --reload`

### Get Camera IP URL

1. Download DroidCam or a similar application.

### Webpage Interaction

1. Follow the tutorial.
2. Type in your IP URL in the following format: `http://<ip>:<port>/video`

### GPU Acceleration with CUDA (Optional)

1. Open command prompt and run `nvidia-smi` to check the required CUDA version.
2. Install the correct CUDA Toolkit from [NVIDIA's CUDA Toolkit page](https://developer.nvidia.com/cuda-downloads).
3. Within the `synthura` virtual environment, uninstall the current torch installation:
   - `pip uninstall torch torchvision torchaudio`
4. Install the correct version of torch for your CUDA Toolkit by using the appropriate command from [PyTorch's official site](https://pytorch.org/get-started/locally/). 
   - Example: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121`
