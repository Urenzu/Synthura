/* 

Description: Establishes a WebRTC connection with the server to stream video from a camera.

Parent Component(s): CameraGrid

*/

import React from 'react'
import './VideoFrame.css';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useWebSocket } from '../../scripts/WebSocketContext';


const VideoFrame = ({ id, handleRemoveCamera, cameraURL, cameraName }) => {

  const videoRef = useRef(null);
  const initializedRef = useRef(false);
  const { status, offer, sendMessage } = useWebSocket();

  const establishWebRTCConnection = async () => {

    const pc = new RTCPeerConnection();

    // Stream video track from server to video element
    pc.ontrack = (event) => {
      if(event.track.kind === 'video') {
        console.log("streaming video");
        videoRef.current.srcObject = event.streams[0];
      }
    }

    const offerDescription = {
      type: 'offer',
      sdp: offer
    }
  
    // Set remote description of peer connection
    await pc.setRemoteDescription(offerDescription);

    // Create answer and set local description
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send answer to server
    sendMessage(JSON.stringify({
      type: 'answer',
      sdp: pc.localDescription.sdp
    }));
  }

  useEffect(() => {

    // Wait for websocket connection to be established
    if(status === 'disconnected') {
      return;
    }

    // Return if WebRTC connection has already been established
    if (initializedRef.current) {
      return;
    }
    
    // Send camera info and initiate WebRTC connection process
    if (!offer) {
      sendMessage(JSON.stringify({ 
        type: 'camera_info',
        camera_url: cameraURL,
        camera_id: id
      }));

    }
    // Establish WebRTC connection
    else {
      establishWebRTCConnection();
      initializedRef.current = true;
    }
      
  }, [status, offer] );

  useEffect(() => {
    return () => {
      if(initializedRef.current) {
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
      }
    }
  }, [])

  return (
    <div data-testid={id} className="video-frame">
      <div className="live-video-bar">
        <span>{cameraName}</span>
        <button className="close-camera-button" onClick={() => handleRemoveCamera(id, cameraName)}>
          <svg id="close-camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </button>
      </div>
      <div className="live-video-container">
        <video ref={videoRef} autoPlay />
      </div>
    </div>
  );
};

VideoFrame.propTypes = {
  id: PropTypes.number.isRequired,
  handleRemoveCamera: PropTypes.func.isRequired,
};

export default VideoFrame;