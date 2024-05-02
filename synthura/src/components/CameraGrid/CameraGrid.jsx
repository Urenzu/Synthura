import { useState, useEffect } from 'react';
import VideoFrame from '../VideoFrame/VideoFrame';
import './CameraGrid.css';
import { LinkedList } from '../../scripts/LinkedList';

const CameraGrid = () => {
  const [activeCameras, setActiveCameras] = useState([]);
  const [camList, setCamList] = useState(new LinkedList());
  const [id, setId] = useState(1);
  const [cameraIP, setCameraIP] = useState('');

  const handleAddCamera = () => {
    if (cameraIP) {

      setCamList(prevList => {
        const updatedList = new LinkedList();
        Object.assign(updatedList, prevList);
        if (!updatedList.isPresent(id)) {
          updatedList.append(id, <VideoFrame key={id} camNum={id} cameraIP={cameraIP} handleRemoveCamera={handleRemoveCamera} />);
          setId(id + 1);
        }
        return updatedList;
      });

    } 

    else {
      console.error('No camera IP provided');
    }
  };

  useEffect(() => {
    setActiveCameras(camList.render());
  }, [camList]);

  const handleRemoveCamera = (rem) => {
    setCamList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList);
      updatedList.remove(rem);
      return updatedList;
    });
  };

  return (
    <section id="camera-grid-container">
      <h2>Enter Device IP Address</h2>
      <div id="input-url-container">
        <input
          type="text"
          id="cameraIP"
          placeholder="Enter Camera IP"
          autoComplete="off"
          onChange={(e) => setCameraIP(e.target.value)}
        />
        <button id="add-camera-btn" onClick={handleAddCamera}>
          <svg id="plus-sign" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
          </svg>
        </button>
      </div>
      <div id="camera-grid">{activeCameras}</div>
    </section>
  );
};

export default CameraGrid;