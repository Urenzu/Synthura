import { React, useEffect, useRef } from 'react'
import { useWebSocket } from '../../scripts/WebSocketContext';
import './AnalyticsFeed.css';

const AnalyticsFeed = (id) => {

  const { detectedObjects, sendMessage } = useWebSocket();
  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage(JSON.stringify({
        type: 'analytics',
        camera_id: id
      }));
    }, 1000);
  }, [sendMessage]);
  
  return (
    <div className="analytics-feed" >
      <p>Objects: {detectedObjects}</p>
    </div>
  )
}

export default AnalyticsFeed
