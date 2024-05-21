import './VideoFrame.css';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

const VideoFrame = ({ camNum, handleRemoveCamera, cameraURL }) => {

  const videoRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {

    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const websocketUrl = `ws://localhost:8000/api/video_feed/ws`;
    const websocket = new WebSocket(websocketUrl);

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

    websocket.onopen = () => {

      // Send camera IP to server
      websocket.send(JSON.stringify({ 
        type: 'camera_info',
        camera_url: cameraURL,
        camera_id: camNum
      }));

      // Handle incoming offer from server
      websocket.onmessage = async (event) => {

        const offer = {
          type: 'offer',
          sdp: event.data
        };

        // Set remote description of peer connection
        await pc.setRemoteDescription(offer);

        // Create answer and set local description
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer to server
        websocket.send(JSON.stringify({
          type: 'answer',
          sdp: pc.localDescription.sdp
        }));
      }
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      }
      websocket.onclose = () => {
        console.log('WebSocket closed');
      }
    }
  }, [camNum, cameraIP, videoRef] );

  return (
    <div className="video-frame">
      <div className="live-video-bar">
        <span>Camera {camNum}</span>
        <button id="close-camera-button" onClick={() => handleRemoveCamera(camNum)}>
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
  camNum: PropTypes.number.isRequired,
  handleRemoveCamera: PropTypes.func.isRequired,
};

export default VideoFrame;
