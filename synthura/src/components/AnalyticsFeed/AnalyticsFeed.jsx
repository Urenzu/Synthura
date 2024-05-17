/* 

Description: Fetches object data from server and displays it in a list format.

Parent Component(s): CameraGrid

*/

import { React, useEffect, useRef } from 'react'
import { useWebSocket } from '../../scripts/WebSocketContext';
import './AnalyticsFeed.css';

const AnalyticsFeed = (id) => {

  const intervalRef = useRef(null);
  const { offer, status, detectedObjects, sendMessage } = useWebSocket();

  useEffect(() => {

    // Wait for pc connection to be established
    if(!offer) {
      return;
    }

    // Send analytics request to server every second
    intervalRef.current = setInterval(() => {
      console.log(status);
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
      <p>Objects: </p>
      <ul>
        {detectedObjects.map((object, index) => (
          <li key={index}>{object}</li>
        ))}
      </ul>
    </div>
  )
}

export default AnalyticsFeed
