/* 

Description: Displays live video feeds and analytics feeds for each camera. Handles adding and removing cameras from the grid.

Parent Component(s): EnvironmentsPage

Child Component(s): AnalyticsFeed, VideoFrame, NameComponent

*/

import { React, useState, useEffect, act } from 'react';
import VideoFrame from '../VideoFrame/VideoFrame';
import AnalyticsFeed from '../AnalyticsFeed/AnalyticsFeed';
import { WebSocketProvider } from '../../scripts/WebSocketContext';
import { useEnvironmentPage } from '../../scripts/EnvironmentsPageContext';
import { useCameraConnection } from '../../scripts/CameraConnectionContext';
import { LinkedList } from '../../scripts/LinkedList';

import './CameraGrid.css';

const CameraGrid = () => {

  // Local State
  const [activeCameras, setActiveCameras] = useState([]);
  const [id, setId] = useState(1);
  const [cameraURL, setCameraURL] = useState('');
  const [addingCamera, setAddingCamera] = useState(false);

  // Context
  const { name, canceled, entered, setPrompt, setActive, setName, setCanceled, setEntered, setError } = useEnvironmentPage();
  const { connections, globalCluster, globalEnvironment, updateConnections, renderConnectionList } = useCameraConnection();

  // Custom function to check array equality
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };
  
  useEffect(() => {
    // Check if a camera is being added
    if (addingCamera) {
      // Cancel the operation
      if(canceled) {
        setCanceled(false);
        setAddingCamera(false);
        setActive(false);
        setName("");
      }
      // Add camera to the grid
      else {
        let temp_name = name;
        updateConnections((prevMap) => {
          const updatedMap = new Map(prevMap);
          const key = Array.from(connections.keys()).find(k => arraysEqual(k, [globalEnvironment, globalCluster]));
          let list;
          if (key) {
            list = connections.get(key);
          }
          else {
            list = new LinkedList();
          }
          list.append(temp_name,
            <div key={id} className="live-feed" >
              <WebSocketProvider>
                <VideoFrame  id={id} cameraURL={cameraURL} handleRemoveCamera={handleRemoveCamera} cameraName={temp_name} />
                <AnalyticsFeed id={id} />
              </WebSocketProvider>
            </div>
          );
          updatedMap.set(key, list);
          return updatedMap;
        });
      }
      setId(id + 2);
      setActive(false);
      setEntered(false);
      setAddingCamera(false);
      setName("");
    }
  }, [entered, canceled]);

  // add a live feed to the camera grid. this includes a video frame and an analytics feed Component.
  const handleAddCamera = () => {
    if (cameraURL) {
      setPrompt('Enter Camera Name');
      setActive(true);
      setAddingCamera(true);
    } 
    else {
      console.error('No URL provided');
    }
  };


  // update active cameras the moment connections map changes
  useEffect(() => {

    const key = Array.from(connections.keys()).find(k => arraysEqual(k, [globalEnvironment, globalCluster]));
    if (key) {
      setActiveCameras(renderConnectionList(key));
    }

  }, [connections, globalCluster]);

  // remove a live feed from the camera grid
  const handleRemoveCamera = (id, name, camera_url) => {

    const key = Array.from(connections.keys()).find(k => arraysEqual(k, [globalEnvironment, globalCluster]));

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
    
    updateConnections((prevMap) => {
        const updatedMap = new Map(prevMap);
        let list = updatedMap.get(key);
        list.remove(name);
        updatedMap.set(key, list);
        return updatedMap;
      }
    )
    setActiveURLS(prevURLs => prevURLs.filter(url => camera_url !== url));
  };

  return (
    <>
      {(globalCluster && globalEnvironment) && (
        <section id="camera-grid-container">
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
      )}
    </>
  );
};

export default CameraGrid;