/* 

Contributor(s): Owen Arnst

Description: This component is a sidebar that facilitates the management of environments and clusters.

Parent Component(s): EnvironmentPage

Child Component(s): EnvironmentContainer

*/

import "./EnvironmentSideBar.css"
import EnvironmentContainer from "../EnvironmentContainer/EnvironmentContainer"
import { LinkedList } from '../../scripts/LinkedList';
import { useState, useEffect } from 'react';
import { useEnvironmentPage } from "../../scripts/EnvironmentsPageContext";

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);
  const { name, canceled, entered, environmentsMap, setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsMap } = useEnvironmentPage();
  const [addingEnvironment, setAddingEnvironment] = useState(false);

  // Delete an environment
  const handleDeleteEnvironment= (rem, environment_name) => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
    setEnvironmentsMap(prevMap => {
      const updatedMap = new Map(prevMap); // Create a shallow copy of the previous map
      updatedMap.delete(environment_name); // Append new data
      return updatedMap; // Return updated map
    });
  }

  // Add a new environment
  useEffect(() => {
    if (addingEnvironment) {
      if(canceled) {
        setCanceled(false);
        setAddingEnvironment(false);
        setActive(false);
        setName("");
      }
      else if (environmentsMap.has(name)) {
        setError("Error: Environments must have unique names.");
        setEntered(false);
      }
      else {
        let temp_name = name;
        setEnvironmentsList(prevList => {
          const updatedList = new LinkedList();
          Object.assign(updatedList, prevList); // Copy previous state
          if(!updatedList.isPresent(id)) {
            updatedList.append(id, <EnvironmentContainer key={id} handleDeleteEnvironment={handleDeleteEnvironment} env_id={id} environment_name={temp_name}/>); // Append new data
            setId(id+1);
          }
          return updatedList; // Return updated list
        });
        setEnvironmentsMap(prevMap => {
          const updatedMap = new Map(prevMap); // Create a shallow copy of the previous map
          updatedMap.set(temp_name, []); // Append new data
          return updatedMap; // Return updated map
        })
        setEntered(false);
        setActive(false);
        setAddingEnvironment(false);
        setName("");
      }
    }
  }, [entered, canceled]);

  // create a new environment
  const handleCreateEnvironment = () => {
    setPrompt("Enter Environment Name");
    setActive(true);
    setAddingEnvironment(true);
  }

  // renders updated column of environments
  useEffect(() => { 
    setActiveEnvironments(environmentsList.render());
  }, [environmentsList]);

  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2>Manage Environments</h2>
        <div id="environments">
          {activeEnvironments}
        </div>
      <button id="add-environment-btn" onClick={handleCreateEnvironment} >Add Environment</button>
    </section>
  )
}

export default EnvironmentSideBar
