/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component is a sidebar that facilitates the management of environments and clusters.

Parent Component(s): EnvironmentPage

Child Component(s): EnvironmentContainer

*/

import "./EnvironmentSideBar.css"
import EnvironmentContainer from "../EnvironmentContainer/EnvironmentContainer"
import { LinkedList } from '../../scripts/LinkedList';
import { useState, useEffect } from 'react';

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);

  // Delete an environment
  const handleDeleteEnvironment= (IdToRemove) => {
    //TEMP
    return environmentsList
    // setEnvironmentsList(prevList => {
    //   const updatedList = new LinkedList();
    //   Object.assign(updatedList, prevList); // Copy previous state
    //   const EnvToDelete = updatedList.find(environment => environment.id === IdToRemove)
      
    //   // Remove specified data. should awlays exist, extra check for extra precaution
    //   if (EnvToDelete) {
    //     // Remove the environment from the list
    //     updatedList.remove(EnvToDelete);
    //   } else {
    //     console.error(`Environment with ID ${IdToRemove} not found`);
    //   }
      
    //   return updatedList; // Return updated list
    // });
  }

  // create a new environment
  const handleCreateEnvironment = () => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      if(!updatedList.isPresent(id)) {
        //key is for id in environmentsList, env_id id for EnvironmentContainer
        let EnvName = "Environment" + id
        // let curr = {
        //   id: id,
        //   Name: EnvName,
        //   Environment: <EnvironmentContainer key={id} EnvName = {Name} env_id={id} handleDeleteEnvironment={handleDeleteEnvironment}/>
        // }
        updatedList.append(id, <EnvironmentContainer key={id} EnvName = {Name} env_id={id} handleDeleteEnvironment={handleDeleteEnvironment}/>
        ); // Append new data
        setId(id+1);
      }
      return updatedList; // Return updated list
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

  // renders updated column of environments
  useEffect(() => { 
    setActiveEnvironments(environmentsList.render());
  }, [environmentsList]);




  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2 style={{ marginTop: "50px" }}>Manage Environments</h2>
        <div className="environment">
          {activeEnvironments}
        </div>
      <button id="add-environment-btn" onClick={handleCreateEnvironment} >Add Environment</button>
    </section> 
  )
}

export default EnvironmentSideBar