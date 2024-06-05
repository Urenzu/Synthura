/* 

Description: This component encompasses the entire Environments page, including the CameraGrid and EnvironmentSideBar components.

Parent Component(s): App

Child Component(s): EnvironmentSideBar, CameraGrid

*/

import CameraGrid from '../../components/CameraGrid/CameraGrid';
import EnvironmentSideBar from '../../components/EnvironmentSideBar/EnvironmentSideBar';
import Popup from '../../components/PopUp/PopUp';
import { useState, useEffect } from "react";
import { useEnvironmentPage } from '../../scripts/EnvironmentsPageContext';
import { useCameraConnection } from '../../scripts/CameraConnectionContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './EnvironmentsPage.css';


const EnvironmentsPage = () => {

  const {state} = useLocation();
  const navigate = useNavigate();
  const username = state.username;
  console.log(username);
  const [ showSideBar, setShowSideBar ] = useState(true);
  const { prompt, active, name, error, setName, setCanceled, setEntered, setError } = useEnvironmentPage();
  const { globalCluster, globalEnvironment } = useCameraConnection();

  // show sidebar when the hamburger image is clicked
  const toggleSideBar = () => {
    setShowSideBar(!showSideBar);
  };

  // change the name state when the user types in the input field
  const handleChange = (e) => {
    setName(e.target.value);
    if(error) {
      setError(null);
    }
  }

  // set the canceled state to true
  const handleCancel = () => {
    setCanceled(true);
  }

  // set the entered state to true
  const handleEnter = () => {
    if (name.trim()) {
      setEntered(true);
    }
    else {
      setError("Error: Name cannot be empty.");
    }
  }

  //Tutorial CODE
  const [currentPopup, setCurrentPopup] = useState(0);

  useEffect(() => {
    // This effect runs whenever currentPopup changes
    console.log("in useeffect :P currentPopup now", currentPopup)
  }, [currentPopup]);


  const popups = [
    {
      message: 'Would you like a tutorial on how to use the interface?',
      buttons: ['Begin', 'Skip'],
      position: 'center',
      onButtonClick: (index) => {
        if (index === 0) {
          console.log('Starting Tutorial');
          setCurrentPopup(currentPopup + 1); // Move to next popup
          console.log("currentPopup now", currentPopup)
        }
        else if (index === 1) {
            console.log('Skipping Tutorial');
            setCurrentPopup(currentPopup + popups.length + 1); 
          }
      },
    },
    //second pop up is to make a new environment
    {
        message: "Click on the button in the top left corner to toggle the environments menu. Then click 'Add Environment' at the bottom of the menu.",
        buttons: ['Continue'],
        position: 'top-left',
        onButtonClick: (index) => {
            setCurrentPopup(currentPopup + 1); // Move to next popup
            console.log("currentPopup now", currentPopup)
        },
      },
      //third pop up is to name a new environment
    {
        message: "Please name the environment. An environment is usually a generic location, so you can name it something like 'California Warehouse' or 'Miami Condo'",
        buttons: ['Continue'],
        position: 'middle-right',
        onButtonClick: (index) => {
            setCurrentPopup(currentPopup + 1); // Move to next popup
            console.log("currentPopup now", currentPopup)

        },
      },
      //forth pop up is to make a new cluster
    {
        message: 'Hover over the environment. Click the plus to add a cluster to the environment.',
        buttons: ['Continue'],
        position: 'top-left',
        onButtonClick: (index) => {
            setCurrentPopup(currentPopup + 1); // Move to next popup
            console.log("currentPopup now", currentPopup)
        },
      },

         //fifth pop up is to name the cluster
    {
      message: "Name the cluster. A cluster consists of a set of cameras, typically depicting a room, floor, or building. Appropriate names could be 'Store 1' or 'Floor 1'.",
      buttons: ['Continue'],
      position: 'middle-right',
      onButtonClick: (index) => {
          setCurrentPopup(currentPopup + 1); // Move to next popup
          console.log("currentPopup now", currentPopup)
      },
    },
      //fifth pop up is to add a camera connection
    {
        message: "Add a camera to this cluster by entering in the camera's IP address in format http://<ip>:<port>/video. Hit the plus sign once you are done.",
        buttons: ['Continue'],
        position: 'top-right',
        onButtonClick: (index) => {
            setCurrentPopup(currentPopup + 1); // Move to next popup
            console.log("currentPopup now", currentPopup)
        },
      },
      //sixth pop up is naming camera
    {
      message: "Name this camera. Cameras are usually named based on where they are placed. Example names could be 'Front Entrance' or 'Main Hallway'.",
      buttons: ['Continue'],
      position: 'middle-right',
      onButtonClick: (index) => {
          setCurrentPopup(currentPopup + 1); // Move to next popup
          console.log("currentPopup now", currentPopup)
      },
    },
      //seventh pop up is about viewing your feed
      {
        message: "You can see your camera feed live here. Objects in the feed are recognized and listed below the feed.",
        buttons: ['Continue'],
        position: 'center',
        onButtonClick: (index) => {
            setCurrentPopup(currentPopup + 1); // Move to next popup
            console.log("currentPopup now", currentPopup)
        },
      },
        //eight pop up is to save the camera
    {
      message: "At any point, you can save each camera's feed. That way you'll never miss anything! You can view these saved videos in the recordings page.",
      buttons: ['Continue'],
      position: 'top-right',
      onButtonClick: (index) => {
          setCurrentPopup(currentPopup + 1); // Move to next popup
          console.log("currentPopup now", currentPopup)
      },
    },
    //ninth pop up is general message
    {
      message: "Continue adding environments, clusters, and cameras as you see fit. The basic idea is that environments have clusters which have cameras. Our simple design will allow you to easily keep your properties safe.",
      buttons: ['Done'],
      position: 'center',
      onButtonClick: (index) => {
          //setCurrentPopup(currentPopup + 1); // Move to next popup
          setCurrentPopup(currentPopup + 1);
          console.log("done with popups")
      },
    },
    // Add more popup objects here with their messages and buttons
    // More pop ups to 
        // see how to save videos? if that is an option
  ];

  const handleNavigateToRecordings = () => {
    console.log("Navigated to Recordings Page");
    navigate("/recordings", {state: {username: username}});
  }
  
  const handleSignOut = () => {
    console.log("Signed Out");
    navigate("/");
  }

  return (
      <>
        <div className={"name-component-field" + (active ? " show" : "")} >
          <h2>{prompt}</h2>
          <input value={name} onChange={handleChange} type="text" />
          {error ? 
            <div id="error-message-naming-component" >
              <span>{error}</span>
              <button onClick={() => setError("") }>OK</button>
            </div> :
            <div className="name-component-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleEnter}>Enter</button>
            </div>
          }
        </div>
        <section id="environments-page" className={active || currentPopup===0 ? "environments-page-blur" : ""} >
          <nav id="environments-page-nav-bar">
            <svg id="side-bar-icon" onClick={toggleSideBar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 
              14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 
              0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
            </svg>
            {(globalEnvironment && globalCluster) && (<h3>Viewing Cluster <span className="emphasize">{globalCluster}</span> of Environment <span className="emphasize">{globalEnvironment}</span></h3>)}
            <button id="recordings-page-link" onClick={handleNavigateToRecordings}>Go to Recordings Page</button>
          </nav>
          <EnvironmentSideBar showSideBar={showSideBar} />
          <CameraGrid username={username} />
        </section>
        {popups[currentPopup] && (
        <Popup
          message={popups[currentPopup].message}
          buttons={popups[currentPopup].buttons}
          onButtonClick={popups[currentPopup].onButtonClick}
          showArrow={popups[currentPopup].showArrow} 
          position={popups[currentPopup].position}
        />
        )}
        <button onClick={handleSignOut}>Sign Out</button>
      </>
  );
}

export default EnvironmentsPage