# Synthura

## To get local host running

Bring up webpage:
1. cd synthura <br>
2. npm install <br>
3. npm run dev <br>

Bring up server:
1. cd synthura <br>
2. cd backend <br>
3. python -m venv synthura <br>
4. synthura\Scripts\activate (In base backend directory) <br>
5. pip install opencv-python ultralytics fastapi uvicorn aiortc av websockets torch <br>
6  pip install -q git+https://github.com/THU-MIG/yolov10.git <br>
7. To run: uvicorn backend:app --reload <br>

Get camera IP URL:
1. Download droidcam or similar application <br>

On webpage:
1. Follow the tutorial
2. Type in your IP URL in this format http://<ip>:<port>/video <br>

If you want cuda GPU:
1. cmd: nvidia-smi <br>
2. Check what cuda version you would need to install (Right side). <br>
3. Install: Correct CUDA Toolkit. (Example Toolkit: https://developer.nvidia.com/cuda-downloads) <br>
4. Install: Correct torch version for your CUDA Toolkit within virtual environment from the website: https://pytorch.org/get-started/locally/ (Make sure to 'pip unistall torch torchvision torchaudio' first) <br>
Example command for synthura virtual environment: pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 <br>
