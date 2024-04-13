{/*

Contributor(s): Owen Arnst

Description: This component is a grid of video frames that display live feeds from cameras. The user can add 
cameras to the grid by clicking the plus sign nested in an empty video frame.

*/}

import { useState } from 'react';
import VideoFrame from './VideoFrame';
import './tempStyles/CameraGrid.css';


const CameraGrid = () => {

  const [activeCameras, setActiveCameras] = useState([]);
  const [camNum, setCamNum] = useState(1);

  const handleAddCamera = () => {
    setActiveCameras([...activeCameras, <VideoFrame key={activeCameras.length} type="liveVideo" camNum={camNum} />]);
    setCamNum(camNum + 1);
  }

  return (
    <section id="camera-grid-container">
      {activeCameras}
      <VideoFrame type="addCamera" handleAddCamera={handleAddCamera} />
    </section>
  )
}

export default CameraGrid
