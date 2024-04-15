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

  const handleAddCamera = (url) => {
    if (url) {
        // Setup the video stream
        if (url.startsWith('http')) {
          // If the URL is direct video stream
            setCamList(prevList => {
              const updatedList = new LinkedList();
              Object.assign(updatedList, prevList); // Copy previous state
              updatedList.append(id, <VideoFrame key={id} type="liveVideo" srcFeed={url} camNum={id} handleRemoveCamera={handleRemoveCamera} />); // Append new data
              return updatedList; // Return updated list
            });
            setId(id+1);
        } else {
            // Use WebRTC or other technologies to set up the stream
            console.error('Invalid URL or setup required for WebRTC or similar technology');
        }
    }
    else {
         console.error('No URL provided');
    }
  }

  // will run when camList updates
  useEffect(() => { 
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
      <h2>Live Stream Inputs</h2>
        <input type="text" id="streamUrl" placeholder="Enter Stream URL" />
        <button onclick={handleAddCamera}>Add Stream</button>
      <div id="camera-grid">
        {activeCameras}
      </div>
    </section>
  )
}

export default CameraGrid
