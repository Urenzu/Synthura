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

  const [activeCameras, setActiveCameras] = useState([]);   //array of cameras
  const [camList, setCamList] = useState(new LinkedList()); //LinkedList of cameras
  const [id, setId] = useState(1); //id
  const [url, setUrl] = useState(''); //url

  // adds a camera to the grid
  const handleAddCamera = () => {
    if (url) {
        // Setup the video stream
        if (url.startsWith('https')) {
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

  // will run when camList updates, renders updated grid of cameras
  useEffect(() => { 
    console.log("camList updated");
    setActiveCameras(camList.render());
  }, [camList]);

  // Remove a camera from the grid
  const handleRemoveCamera = (rem) => {
    setCamList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
  }

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  }

  return (
    <section id="camera-grid-container">
      <h2>Live Stream Inputs</h2>
      <div id="input-url-container">
        <input type="text" id="streamUrl" placeholder="Enter Stream URL" onChange={handleInputChange} />
        <button id="add-camera-btn" onClick={handleAddCamera}>
          <svg id="plus-sign" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 
            32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
          </svg>
        </button>
      </div>
      <div id="camera-grid">
        {activeCameras}
      </div>
    </section>
  )
}

export default CameraGrid
