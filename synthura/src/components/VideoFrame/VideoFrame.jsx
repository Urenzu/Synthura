import './VideoFrame.css';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

const VideoFrame = ({ websocket, camNum, handleRemoveCamera }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection();

    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    websocket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        websocket.send(JSON.stringify(answer));
      }
    };

    return () => {
      peerConnection.close();
      websocket.close();
    };
  }, [websocket]);

  return (
    <div className="video-frame">
      <div className="live-video-bar">
        <span>Camera {camNum}</span>
        <button id="close-camera-button" onClick={() => handleRemoveCamera(camNum)}>
          {/* ... */}
        </button>
      </div>
      <div className="live-video-container">
        <video ref={videoRef} autoPlay />
      </div>
    </div>
  );
};

VideoFrame.propTypes = {
  websocket: PropTypes.instanceOf(WebSocket).isRequired,
  camNum: PropTypes.number.isRequired,
  handleRemoveCamera: PropTypes.func.isRequired,
};

export default VideoFrame;
