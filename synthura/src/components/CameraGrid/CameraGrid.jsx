/* 

Description: Displays live video feeds and analytics feeds for each camera. Handles adding and removing cameras from the grid.

Parent Component(s): EnvironmentsPage

Child Component(s): AnalyticsFeed, VideoFrame, NameComponent

*/

import { React, useState, useEffect } from 'react';
import VideoFrame from '../VideoFrame/VideoFrame';
import AnalyticsFeed from '../AnalyticsFeed/AnalyticsFeed';
import { WebSocketProvider } from '../../scripts/WebSocketContext';
import { useNameComponent } from '../../scripts/NameComponentContext';

import './CameraGrid.css';
import { LinkedList } from '../../scripts/LinkedList';

const CameraGrid = () => {

  const [activeCameras, setActiveCameras] = useState([]);
  const [camList, setCamList] = useState(new LinkedList());
  const [id, setId] = useState(1);
  const [cameraURL, setCameraURL] = useState('');
  const { canceled, active, name, setCanceled, setName, setActive, setText } = useNameComponent();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!active && entered && !canceled) {
      let temp_name = name;
      setCamList(prevList => {
        const updatedList = new LinkedList();
        Object.assign(updatedList, prevList);
        if (!updatedList.isPresent(id)) {
          updatedList.append(id, <div key={id} className="live-feed" >
                                  <WebSocketProvider>
                                    <VideoFrame  id={id} cameraURL={cameraURL} handleRemoveCamera={handleRemoveCamera} cameraName={temp_name} />
                                    <AnalyticsFeed id={id} />
                                  </WebSocketProvider>
                                 </div>);
          setId(id + 2);
        }
        return updatedList;
      });
      setName("");
      setEntered(false);
    }
    else if (canceled) {
      setCanceled(false);
      setEntered(false);
    }
  }, [active]);

  // add a live feed to the camera grid. this includes a video frame and an analytics feed Component.
  const handleAddCamera = () => {
    if (cameraURL) {
      setText('Enter Camera Name');
      setEntered(true);
      setActive(true);
    } 
    else {
      console.error('No URL provided');
    }

  };

  // update active cameras the moment camList changes
  useEffect(() => {
    setActiveCameras(camList.render());
  }, [camList]);

  // remove a live feed from the camera grid
  const handleRemoveCamera = (id) => {

    fetch(`http://localhost:8000/api/remove_camera/${id}`, {
      method: 'GET'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to remove camera');
        }
        else {
          console.log("Camera connection closed")
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });

    setCamList(prevList => {

      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList);
      updatedList.remove(id);
      if (updatedList.getSize() === 0) {
        setId(1);
      }
      return updatedList;
    });

  };

  return (
    <section id="camera-grid-container">
      <h2>Enter Device IP Address</h2>
      <div id="input-url-container" >
        <input
          type="text"
          id="cameraIP"
          placeholder="Enter Camera IP"
          autoComplete="off"
          onChange={(e) => setCameraURL(e.target.value)}
          data-testid="cameraIP-test"
        />
        <button id="add-camera-btn" data-testid={`add-camera-btn-${id}`} onClick={handleAddCamera}>
          <svg id="plus-sign" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
          </svg>
        </button>
      </div>
      <div id="camera-grid">
        {activeCameras}
      </div>
    </section>
  );
};

export default CameraGrid;