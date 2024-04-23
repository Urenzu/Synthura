{/*

Contributor(s): Owen Arnst

Description: This component is a frame that displays videos specified by srcFeed. See accepted propTypes below component function.

Parent Component(s): CameraGrid

Child Component(s): None

*/}

import './VideoFrame.css';
import PropTypes from 'prop-types';

const VideoFrame = ( {srcFeed, camNum, handleRemoveCamera} ) => {

    return (
      <div className="video-frame ">
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
          <video src={srcFeed} autoPlay={true} />
        </div>
      </div>
    );

};

VideoFrame.propTypes = {
  srcFeed: PropTypes.string.isRequired, 
  camNum: PropTypes.number.isRequired,
  handleRemoveCamera: PropTypes.func.isRequired
};

export default VideoFrame
