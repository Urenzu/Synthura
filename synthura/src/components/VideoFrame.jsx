{/* Documentation
Contributor(s): Owen Arnst
Description: This component is a video frame that displays a live feed from a camera, saved video playback, or an add camera
button depending on the 'type' prop.
*/}

import './VideoFrame.css';
import addCameraIcon from '../assets/addCameraIcon.svg';
import Button from './Button';
import Webcam from 'react-webcam';

const VideoFrame = ( {srcFeed, type, handleAddCamera} ) => {

  const renderLiveFeed = () => {
    const videoConstraints = {
      aspectRatio: 1,
    };

    return (
        <Webcam videoConstraints={videoConstraints}
          style={{ height: "20rem", width: "20rem", border: "#3e3e42 solid 5px", borderRadius: "1%" }}
        />
    );
  };

  const renderSavedVideo = () => (
    <>
        <div className="video-frame">
            <video src={srcFeed} controls />
        </div>
    </>
  );

  const renderAddCamera = () => (
    <>
        <div className="video-frame">
            <span id="plus-sign-span">
              <button id="add-camera-button" onClick={handleAddCamera} >
                <svg id="plus-sign" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 
                  32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
                </svg>
              </button>
            </span>
        </div>
    </>
  );

  return type==="addCamera" ? renderAddCamera() : 
         type==="liveVideo" ? renderLiveFeed()  :
         renderSavedVideo();
   
}

export default VideoFrame
