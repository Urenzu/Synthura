import { React, useEffect, useRef } from 'react'
import { useWebSocket } from '../../scripts/WebSocketContext';
import './AnalyticsFeed.css';

const AnalyticsFeed = (id) => {

  const initializedRef = useRef(false);
  const intervalRef = useRef(null); // To store the interval ID
  const { status, detectedObjects, sendMessage } = useWebSocket();

  useEffect(() => {

    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

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

  }, [sendMessage]);
  
  return (
    <div className="analytics-feed" >
      <p>Objects: {detectedObjects}</p>
    </div>
  )
}

export default AnalyticsFeed
