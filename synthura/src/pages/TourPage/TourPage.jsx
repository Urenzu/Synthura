/* 

Description: This component encompasses the entire Environments page, including the CameraGrid and EnvironmentSideBar components.

Parent Component(s): App

Child Component(s): EnvironmentSideBar, CameraGrid

*/

import CameraGrid from '../../components/CameraGrid/CameraGrid';
import EnvironmentSideBar from '../../components/EnvironmentSideBar/EnvironmentSideBar';
import Popup from '../../components/PopUp/PopUp';
import { useState, useEffect } from "react";
import { useNameComponent } from '../../scripts/NameComponentContext';
import { useNavigate } from 'react-router-dom'; // for navigation
import './TourPage.css';


const TourPage = () => {

  const [ showSideBar, setShowSideBar ] = useState(false);
  const [ error, setError ] = useState(false);
  const { name, text, active, setName, setActive, setCanceled } = useNameComponent();
  const navigate = useNavigate();


  // show sidebar when the hamburger image is clicked
  const toggleSideBar = () => {
    setShowSideBar(!showSideBar);
  };

  const handleChange = (e) => {
    setName(e.target.value);
    if(error) {
      setError(false);
    }
  }

  const handleCancel = () => {
    setActive(false);
    setCanceled(true);
    setName('');
  }

  const handleEnter = () => {
    if (name) {
      setActive(false);
    }
    else {
      console.log("Must enter");
      setError(true);
    }
  }

  //TOUR CODE
  const [currentPopup, setCurrentPopup] = useState(0);

  useEffect(() => {
    // This effect runs whenever currentPopup changes
    console.log("in useeffect :P currentPopup now", currentPopup)
  }, [currentPopup]);


  const popups = [
    {
      message: 'Would you like a tour of the interface?',
      position: 'center',
    },
    //second pop up is to make a new environment
    {
        message: 'Click on the button in the top corner to toggle the environments menu.',
        position: 'top-left',
      },
      //third pop up is to name a new environment
    {
        message: 'Please name the environment. An environment is usually a generic location.',
        position: 'middle-right',
      },
      //forth pop up is to make a new cluster
    {
        message: 'Hover over the environment to add a cluster to it. A cluster consists of a set of cameras, typically depicting a room, floor, or building.',
        position: 'top-left',
      },
      //fifth pop up is to add a camera connection
    {
        message: "Add a camera to this cluster by entering in the camera's IP address in format _____. Hit the plus sign once you are done.",
        position: 'top-right',
      },
      //sixth pop up is about viewing 
      {
        message: "You can see your camera feed live here. Objects in the feed are recognized and listed below the feed.",
        position: 'center',
      }
    // Add more popup objects here with their messages and buttons
    // More pop ups to 
        // see how to save videos? if that is an option
  ];

  return (
      <>
        <div className={"name-component-field" + (active ? " show" : "")} >
          <h2>{text}</h2>
          <input value={name} onChange={handleChange} type="text" />
          {error ? 
            <div id="error-message-naming-component" >
              <span>NAME MUST BE 1 OR MORE CHARACTERS</span>
              <button onClick={() => setError(false) }>OK</button>
            </div> :
            <div className="name-component-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleEnter}>Enter</button>
            </div>
          }
        </div>
        <section id="environments-page" className={active ? "environments-page-blur" : ""} >
          <svg id="side-bar-icon" onClick={toggleSideBar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 
            14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 
            0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
          </svg>
          <EnvironmentSideBar showSideBar={showSideBar} />
          <CameraGrid />
        </section>

        {popups[currentPopup] && (
        <Popup
          message={popups[currentPopup].message}
          position={popups[currentPopup].position}
        />
        )}

      </>
  );
}

export default TourPage