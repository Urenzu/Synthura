/* 

Description: Establishes a WebRTC connection with the server to stream video from a camera.

Parent Component(s): CameraGrid

*/

import React from 'react'
import './VideoFrame.css';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../../scripts/WebSocketContext';
import axios from "axios";


const VideoFrame = ({ id, handleRemoveCamera, cameraURL, cameraName }) => {

  // Local state
  const videoRef = useRef(null);
  const initializedRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(false);
  const [ toolTip, setToolTip ] = useState(false);
  const timeoutRef = useRef(null);

  // Context
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

  const handleUpload = async () => {

    console.log("uploading video");
    setIsUploading(true);
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
        console.log('base64Data:', base64Data)
        const data = base64Data.substring(0, 10000);

        const postBodyData = {
          data: base64Data
        };
        
  
        // Make sure filename and base64Data are correctly defined
        if (filename && base64Data) {
          try {
            const response = await axios.post(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/uploadVideo?username=Owen&filename=${filename}&data=${data}`, postBodyData, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
            console.log(response);
          } catch (error) {
            console.error('Upload failed', error);
          } finally {
            setIsUploading(false);
            setUploadedVideo(true);
          }
        } else {
          console.error('Filename or base64Data is undefined');
          setIsUploading(false);
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

  const handleMouseOver = () => {
    timeoutRef.current = setTimeout(() => {
      setToolTip(true);
    }, 500);
  }

  const handleMouseOut = () => {
    clearTimeout(timeoutRef.current);
    setToolTip(false);
  }

  useEffect(() => {
    if (uploadedVideo) {
      const timer = setTimeout(() => {
        setUploadedVideo(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [uploadedVideo]); 

  return (
    <div className="video-frame">
      <div className="live-video-bar">
        <button className="close-camera-button" onClick={() => handleRemoveCamera(id, cameraName)}>
          <svg className="close-camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </button>
        <p>{cameraName}</p>
        <div className="button-tooltip-container">
          <button className="save-recording-button" onClick={handleUpload} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} disabled={isUploading}>
            <svg className="save-recording-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192zm0 224a128 128 0 1 0 0-256 128 128 0 1 0 0 
              256zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>
            </svg>
          </button>
          {toolTip && <span className="tooltip">Record Feed</span>}
        </div>
        {uploadedVideo && <p className="video-uploaded">Video Uploaded</p>}
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