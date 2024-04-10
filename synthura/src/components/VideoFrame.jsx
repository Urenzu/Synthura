import './VideoFrame.css'
import addCameraIcon from '../assets/addCameraIcon.svg'

const VideoFrame = ( {srcFeed, className, type} ) => {

  const renderAddCamera = () => (
    <>
        <div className="video-feed">
            {/* <iframe src={srcFeed} className={className}></iframe> */}
            <span className="">
                <img id="plus-sign" src={addCameraIcon} alt="Plus Sign" />
            </span>
        </div>
    </>
  );

  return type==="addCamera" && renderAddCamera();
   
}

export default VideoFrame
