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
import { useCameraConnection } from "../../scripts/CameraConnectionContext";
import { ClusterEnvironmentProvider } from "../../scripts/ClusterEnvironmentContext";

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);
  const { name, canceled, entered, environmentsMap, setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsMap } = useEnvironmentPage();
  const { globalEnvironment, updateGlobalEnvironment, updateGlobalCluster } = useCameraConnection();
  const [ addingEnvironment, setAddingEnvironment ] = useState(false);

  // Delete an environment
  const handleDeleteEnvironment= (rem, environment_name) => {
    // Remove environment from the list
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList);
      updatedList.remove(rem);
      return updatedList;
    });
    // Remove environment from the map
    setEnvironmentsMap(prevMap => {
      const updatedMap = new Map(prevMap);
      updatedMap.delete(environment_name);
      return updatedMap;
    });
    // Reset global environment and cluster if active
    if(globalEnvironment === environment_name) {
      updateGlobalEnvironment("");
      updateGlobalCluster("");
    }
  }

  useEffect(() => {
    // Check if this component is adding an environment
    if (addingEnvironment) {
      // Cancel the operation
      if(canceled) {
        setCanceled(false);
        setAddingEnvironment(false);
        setActive(false);
        setName("");
      }
      // Check if the name is already in use
      else if (environmentsMap.has(name)) {
        setError("Error: Environments must have unique names.");
        setEntered(false);
      }
      // Add the environment
      else {
        let temp_name = name;
        setEnvironmentsList(prevList => {
          const updatedList = new LinkedList();
          Object.assign(updatedList, prevList);
          if(!updatedList.isPresent(id)) {
            updatedList.append(id, <ClusterEnvironmentProvider key={id} >
                                     <EnvironmentContainer handleDeleteEnvironment={handleDeleteEnvironment} env_id={id} environment_name={temp_name} />
                                   </ClusterEnvironmentProvider>); // Append new data
            setId(id+1);
          }
          return updatedList;
        });
        setEnvironmentsMap(prevMap => {
          const updatedMap = new Map(prevMap);
          updatedMap.set(temp_name, []);
          return updatedMap;
        })
        updateGlobalEnvironment(temp_name);
        updateGlobalCluster("");
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
