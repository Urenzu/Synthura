/* 

Description: Component to manage the WebSocket connection to the backend server. Utilizes React context so child
             components can access the WebSocket connection. Every instance of this component is a new WebSocket connection.

*/

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {

    const ws = useRef(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [offer, setOffer] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [motionStatus, setMotionStatus] = useState("no motion");
    const initializedRef = useRef(false);

    useEffect(() => {

        // Prevent multiple initializations
        if (initializedRef.current) {
            return;
        }
        initializedRef.current = true;

        ws.current = new WebSocket(`ws://localhost:8000/api/video_feed/ws`);
        
        ws.current.onopen = () => {
            console.log('WebSocket connection established');
            setStatus('connected');
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection established');
            setStatus('disconnected');
        };

        ws.current.onmessage = (event) => {
            try {
                console.log(event.data);
                const data = JSON.parse(event.data);
                if (data.type === 'offer') {
                    setOffer(data.sdp);
                }
                else {
                    setDetectedObjects(data.detected_objects);
                    setMotionStatus(data.motion_status);
                    console.log(data.motion_status);
                }
            } catch (err) {
                console.error('Error parsing Websocket message as JSON data:', err);
            }
        };

    }, []);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        }
    };

    return (
        <WebSocketContext.Provider value={{ status, offer, detectedObjects, sendMessage, motionStatus }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};