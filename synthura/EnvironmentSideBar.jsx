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
    show_cluster: 1,
    EnvironmentContainer: <EnvironmentContainer key={id} env_id={id} EnvName = {name} handleDeleteEnvironment={handleDeleteEnvironment} handleRenameEnvironment={handleRenameEnvironment} show_cluster={1} toggle_cluster={toggle_cluster}/>,
  });

  const toggle_cluster = (id) => {
    setEnvironmentsList(prevList => {
      const updatedList = [];
      Object.assign(updatedList, prevList); // Copy previous state
      let EnvToChange = updatedList.find((environment) => environment.id === id);

      if (EnvToChange) {
        //ternary operation :ooooooooo
        EnvToChange.show_cluster = EnvToChange.show_cluster === 0 ? 1 : 0;
        console.log("Clusters were toggled changed successfully!")
      } else {
        console.error(`Environment with ID ${id} not found, clusters not toggled`);
      }

      return updatedList; // Return updated list
    });

  }
  

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
      console.log("updatedList is", [...prevList, newNode])
      return [...prevList, newNode]; // Return updated list
    });
  }

  // Rename an environment
  const handleRenameEnvironment= (idToRename, NewName) => {
    setEnvironmentsList(prevList => {
      const updatedList = [];
      Object.assign(updatedList, prevList); // Copy previous state
      let EnvToChange = updatedList.find((environment) => environment.id === idToRename);

      if (EnvToChange) {
        EnvToChange.name = NewName
        console.log("Environment Name changed successfully!")
      } else {
        console.error(`Environment with ID ${IdToRemove} not found`);
      }

      return updatedList; // Return updated list
    });
  }


  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2 style={{ marginTop: "50px" }}>Manage Environments</h2>
        <div className="environment">
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {environmentsList.length > 0 && (
            environmentsList.map((environment) => (
              <li key={environment.id}>
                <EnvironmentContainer key={environment.id} env_id={environment.id} EnvName={environment.name} handleDeleteEnvironment={handleDeleteEnvironment} handleRenameEnvironment={handleRenameEnvironment} show_cluster={show_cluster} toggle_cluster={toggle_cluster}/>
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