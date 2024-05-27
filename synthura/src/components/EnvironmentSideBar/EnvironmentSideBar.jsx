/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component is a sidebar that facilitates the management of environments and clusters.

Parent Component(s): EnvironmentPage

Child Component(s): EnvironmentContainer

*/

import "./EnvironmentSideBar.css"
import EnvironmentContainer from "../EnvironmentContainer/EnvironmentContainer"
import { useState, useEffect } from 'react';

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState([]);
  const [id, setId] = useState(1);

  const EnvironmentNode = (id, name) => ({
    id,
    name,
    EnvironmentContainer: <EnvironmentContainer key={id} env_id={id} EnvName = {name} handleDeleteEnvironment={handleDeleteEnvironment} />,
  });
  

  // Delete an environment
  const handleDeleteEnvironment= (idToRemove) => {
    setEnvironmentsList(prevList => {
      if (!prevList.some((environment) => environment.id === idToRemove)) {
        console.error(`Environment with ID ${idToRemove} not found`);
      } else {
        console.log("Environment deleted successfully");
      }

      const updatedList = prevList.filter((environment) => environment.id !== idToRemove);
      
      return updatedList; // Return updated list
    });
  }

  // create a new environment
  const handleCreateEnvironment = () => {
    setEnvironmentsList(prevList => {
      setId(id+1);
      const newNode = EnvironmentNode(id, "ARRAY Environment " + id);
      console.log("newNode is", newNode)
      //updatedList.append(id, <EnvironmentContainer key={id} handleDeleteEnvironment={handleDeleteEnvironment} env_id={id} />); // Append new data
      console.log("updatedList is", [...prevList, newNode])
      return [...prevList, newNode]; // Return updated list
    });
  }

  // Rename an environment
  // const handleRenameEnvironment= (IdRename, NewName) => {
  //   setEnvironmentsList(prevList => {
  //     const updatedList = new LinkedList();
  //     Object.assign(updatedList, prevList); // Copy previous state

  //     const EnvToChange = updatedList.find(environment => environment.id === IdToRemove)
      
  //     // Remove specified data. should awlays exist, extra check for extra precaution
  //     if (EnvToChange) {
  //       // Remove the environment from the list
  //     } else {
  //       console.error(`Environment with ID ${IdToRemove} not found`);
  //     }

  //     return updatedList; // Return updated list
  //   });
  // }


  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2 style={{ marginTop: "50px" }}>Manage Environments</h2>
        <div className="environment">
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {/* Check if environmentsList has data before rendering */}
          {environmentsList.length > 0 && (
            environmentsList.map((environment) => (
              <li key={environment.id}>
                {/* Render the EnvironmentContainer component, passing props if needed */}
                <EnvironmentContainer key={environment.id} env_id={environment.id} EnvName = {environment.name} handleDeleteEnvironment={handleDeleteEnvironment} />
              </li>
            ))
          )}
        </ul>
        </div>
      <button id="add-environment-btn" onClick={handleCreateEnvironment} >Add Environment</button>
    </section>
  );
}

export default EnvironmentSideBar