import './VideoFrame.css'
import addCameraIcon from '../assets/addCameraIcon.svg'
import Button from './Button'
// import { useState, useEffect } from 'react'
import Webcam from 'react-webcam';

const VideoFrame = ( {srcFeed, className, type} ) => {

  const renderLiveFeed = () => {
    const videoConstraints = {
      aspectRatio: 1,
    };

    return (
        <Webcam videoConstraints={videoConstraints}
          style={{ height: "20rem", width: "20rem", border: "#3e3e42 solid 5px" }}
        />
    );
  };

  const renderAddCamera = () => (
    <>
        <div className="video-frame">
            <span id="plus-sign-span">
                <img id="plus-sign" src={addCameraIcon} alt="Plus Sign" />
            </span>
        </div>
    </>
  );

  return type==="addCamera" ? renderAddCamera() : renderLiveFeed();
   
}

export default VideoFrame
