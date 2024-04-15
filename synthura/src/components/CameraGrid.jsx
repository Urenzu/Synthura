{/*

Contributor(s): Owen Arnst

Description: This component is a grid of video frames that display live feeds from cameras. The user can add 
cameras to the grid by clicking the plus sign nested in an empty video frame.

*/}

import { useState, useEffect } from 'react';
import VideoFrame from './VideoFrame';
import './tempStyles/CameraGrid.css';
import { LinkedList } from '../scripts/LinkedList';


const CameraGrid = () => {

  const [activeCameras, setActiveCameras] = useState([]);
  const [camList, setCamList] = useState(new LinkedList());
  const [id, setId] = useState(1);


  const handleAddCamera = () => {
    setCamList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.append(id, <VideoFrame key={id} type="liveVideo" camNum={id} handleRemoveCamera={handleRemoveCamera} />); // Append new data
      return updatedList; // Return updated list
    });
    setId(id+1);
  }

  useEffect(() => { 
    // will run when camList updates
    console.log("camList updated");
    setActiveCameras(camList.render());
  }, [camList]);

  const handleRemoveCamera = (rem) => {
    setCamList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
  }

  return (
    <section id="camera-grid-container">
      {activeCameras}
      <VideoFrame type="addCamera" handleAddCamera={handleAddCamera} />
    </section>
  )
}

export default CameraGrid
