/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component represents a cluster of cameras within an environment.

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/
import React, { useState, useEffect } from 'react';
import "./ClusterButton.css"

const ClusterButton = ( {id, handleDeleteCluster, handleRenameCluster, CluName} ) => {
  console.log("in ClusterButton, id is", id, "CluName is", CluName)

  //to set state of dropdown
  const [isOpen, setIsOpen] = useState(false);

  //toggle dropdown
  const handleClick = () => {
    console.log("Dropdown has been toggled")
    setIsOpen(!isOpen); // Toggle open/closed state
  };




  return (
    <div className="cluster-btn">
        <svg className="environment-dropdown-icon" onClick = {() => handleRenameCluster(id, "NewName bruh!" + id)}xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 
            192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
        <span></span>
        {CluName}
        <svg id="three-dots" onClick = {() => handleClick()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="16" cy="12" r=".5"/>
            <circle cx="18" cy="12" r=".5"/>
            <circle cx="20" cy="12" r=".5" />
        </svg>
        {isOpen &&
          <div id={`dropdown-${id}`} className={`dropdown ${isOpen ? 'show' : ''}`}>
            <button onClick={() => {handleDeleteCluster(id); console.log("Delete button clicked in dropdown")}}>Delete</button>
            <button onClick={() => {handleRenameCluster(id, "DD!!NewName!" + id); console.log("Rename button clicked in dropdown")}}>Rename</button>
          </div>}
    </div>
  )
}

export default ClusterButton
