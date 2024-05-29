/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component is a button that represents an environment and manages its associated clusters

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/
import React, { useState, useEffect } from 'react';
import "./EnvironmentButton.css"

const EnvironmentButton = ( {handleDeleteEnvironment, handleRenameEnvironment, id, EnvName, toggle_cluster} ) => {
  console.log("in EnvironmentButton, id is", id, "EnvName is", EnvName)

  //to set state of dropdown
  const [isOpen, setIsOpen] = useState(false);

  //toggle dropdown
  const handleClick = () => {
    console.log("Dropdown has been toggled")
    setIsOpen(!isOpen); // Toggle open/closed state
  };

  // // Close dropdown on outside click (using useEffect)
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const environmentButton = document.querySelector('.environment-dropdown-btn');
  //     const dropdown = document.getElementById(`dropdown-${id}`);
  //     if (environmentButton && dropdown && !environmentButton.contains(event.target) && !dropdown.contains(event.target)) {
  //       console.log("Closing dropdown of env_id", )
  //       setIsOpen(false);
  //     }
  //   };
  //   // Add event listener on document mount
  //   document.addEventListener('click', handleClickOutside);

  //   // Cleanup function to remove listener on unmount
  //   return () => document.removeEventListener('click', handleClickOutside);
  // }, [isOpen, id]); // Re-run effect when isOpen or id changes


  return (
    <>
       <div className="environment-dropdown-btn">
          <svg className="environment-dropdown-icon" onClick = {() => toggle_cluster()}xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 
            192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
          <span>{EnvName}</span>
          <svg className="three-dots" id="three-dots" onClick = {() => handleClick()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="16" cy="12" r=".5"/>
            <circle cx="18" cy="12" r=".5"/>
            <circle cx="20" cy="12" r=".5" />
          </svg>
          {isOpen &&
          <div id={`dropdown-${id}`} className={`dropdown ${isOpen ? 'show' : ''}`}>
            <button onClick={() => {handleDeleteEnvironment(id); console.log("Delete button clicked in dropdown")}}>Delete</button>
            <button onClick={() => {handleRenameEnvironment(id, "DD!!NewName!" + id); console.log("Rename button clicked in dropdown")}}>Rename</button>
          </div>}
      </div>
    </>
  )
}

export default EnvironmentButton

