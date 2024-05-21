/* 

Contributor(s): Owen Arnst

Description: This component encompasses the entire Environments page, including the CameraGrid and EnvironmentSideBar components.

Parent Component(s): App

Child Component(s): EnvironmentSideBar, CameraGrid

*/

import CameraGrid from '../../components/CameraGrid/CameraGrid';
import EnvironmentSideBar from '../../components/EnvironmentSideBar/EnvironmentSideBar';
import { useState } from "react";
import './EnvironmentsPage.css';

const EnvironmentsPage = () => {

  const [ showSideBar, setShowSideBar ] = useState(false);

  // show sidebar when the hamburger image is clicked
  const toggleSideBar = () => {
    setShowSideBar(!showSideBar);
  };

  return (
      <section id="environments-page">
        <svg id="side-bar-icon" onClick={toggleSideBar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 
          14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 
          0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
        </svg>
        <EnvironmentSideBar showSideBar={showSideBar} />
        <CameraGrid />
      </section>
  );
}

export default EnvironmentsPage


