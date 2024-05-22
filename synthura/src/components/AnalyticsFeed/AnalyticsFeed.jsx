/* 

Description: Fetches object data from server and displays it in a list format.

Parent Component(s): CameraGrid

*/

import { React, useEffect, useRef, useState } from 'react'
import { useWebSocket } from '../../scripts/WebSocketContext';
import './AnalyticsFeed.css';

const AnalyticsFeed = (id) => {

  const intervalRef = useRef(null);
  const { offer, status, detectedObjects, sendMessage, motionStatus } = useWebSocket();
  const [objectFrequency, setObjectFrequency] = useState({});

  // Function to get frequency of objects. Executes whenever detected objects updates.
  useEffect(() => {

    const frequencies = {};
    for (const item of detectedObjects) {
      if(frequencies[item]) {
        frequencies[item]++;
      }
      else {
        frequencies[item] = 1;
      }
    }

    setObjectFrequency(frequencies);

  }, [detectedObjects, status])

  useEffect(() => {

    // Wait for pc connection to be established
    if(!offer) {
      return;
    }

    // Send analytics request to server every second
    intervalRef.current = setInterval(() => {
      if(status === 'connected') {
        sendMessage(JSON.stringify({
          type: 'analytics',
          camera_id: id
        }));
      }
      else {
        clearInterval(intervalRef.current);
      }
    
    
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

  }, [sendMessage, offer, status]);
  
  return (
    <div className="analytics-feed" >
      <div className="objects-div">
        <h2>Detected Objects</h2>
        <div className="objects-container">
          {detectedObjects && Object.keys(objectFrequency).map((object, index) => (
            <p key={index} className="objects">{`${object.toUpperCase()} (${objectFrequency[object]}x)`}</p>
          ))}
        </div>
      </div>
      <div className="status-bar" >
          {motionStatus === "motion" ? <p className="motion">Motion Detected</p> : <p className="no-motion">No Motion Detected</p>}
        </div>
    </div>
  )
}

export default AnalyticsFeed