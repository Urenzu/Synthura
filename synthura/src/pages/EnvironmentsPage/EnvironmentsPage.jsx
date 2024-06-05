/* 

Description: This component encompasses the entire Environments page, including the CameraGrid and EnvironmentSideBar components.

Parent Component(s): App

Child Component(s): EnvironmentSideBar, CameraGrid

*/

import CameraGrid from '../../components/CameraGrid/CameraGrid';
import EnvironmentSideBar from '../../components/EnvironmentSideBar/EnvironmentSideBar';
import { useState } from "react";
import { useNameComponent } from '../../scripts/NameComponentContext';
import { useLocation, useNavigate } from "react-router-dom";
import './EnvironmentsPage.css';


const EnvironmentsPage = () => {

  const {state} = useLocation();
  const navigate = useNavigate();
  const username = state.username;
  const [ showSideBar, setShowSideBar ] = useState(false);
  const [ error, setError ] = useState(false);
  const { name, text, active, setName, setActive, setCanceled } = useNameComponent();

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
  
  const handleSignOut = () => {
    console.log("Signed Out");
    navigate("/");
  }

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
          <CameraGrid username={username} />
        </section>
        <button className="btn signout"onClick={handleSignOut}>Sign Out</button>
      </>
  );
}

export default EnvironmentsPage