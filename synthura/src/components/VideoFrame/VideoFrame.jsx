/* 

Description: Establishes a WebRTC connection with the server to stream video from a camera.

Parent Component(s): CameraGrid

*/

import React from 'react'
import './VideoFrame.css';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useWebSocket } from '../../scripts/WebSocketContext';
import axios from "axios";

const VideoFrame = ({ id, handleRemoveCamera, cameraURL }) => {

  const videoRef = useRef(null);
  const initializedRef = useRef(false);
  const { status, offer, sendMessage } = useWebSocket();

  const establishWebRTCConnection = async () => {
      
    // const websocketUrl = `ws://localhost:8000/api/video_feed/ws`;
    // const websocket = getWebSocket(websocketUrl);

    // Create peer connection and configure ICE server(s)
    // const config = {
    //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    // };
    // const pc = new RTCPeerConnection(config);

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
      
  }, [offer, status] );

  const handleUpload = async () => {
    const stream = videoRef.current.captureStream();
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
  
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1]; // Extract base64 data
        const filename = `camera_${id}_video.mp4`;
        
        // Add console logs to check if filename and base64Data are correctly defined
        console.log('filename:', filename);
        console.log('base64Data:', base64Data.substring(0, 10000))
        const data = base64Data.substring(0, 10000);
  
        // Make sure filename and base64Data are correctly defined
        if (filename && base64Data) {
          const response = await axios.post(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/uploadVideo?username=Owen&filename=${filename}&data=${data}`);
          console.log(response);
        } else {
          console.error('Filename or base64Data is undefined');
        }
      };
      
      reader.readAsDataURL(blob);
    };
  
    mediaRecorder.start();
  
    setTimeout(() => {
      mediaRecorder.stop();
    }, 30000); // Recording for 30 seconds
  };
  

  const handleDownload = async () => {
    const stream = videoRef.current.captureStream();
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `camera_${id}_video.mp4`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 30000); // Recording for 5 seconds, you can adjust this as per your requirement
  };

  return (
    <div data-testid={id} className="video-frame">
      <div className="live-video-bar">
        <span>Camera {id}</span>
        <button className="close-camera-button" data-testid={`close-camera-btn-${id}`} onClick={() => handleRemoveCamera(id)}>
          <svg id="close-camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </button>
      </div>
      <div className="live-video-container">
        <video ref={videoRef} autoPlay />
        <button onClick={handleUpload}>
          Save Video
        </button>
      </div>
    </div>
  );
};

VideoFrame.propTypes = {
  id: PropTypes.number.isRequired,
  handleRemoveCamera: PropTypes.func.isRequired,
};

export default VideoFrame;