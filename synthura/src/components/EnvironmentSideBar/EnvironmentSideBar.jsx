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

  // Local State
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);
  const [ addingEnvironment, setAddingEnvironment ] = useState(false);

  // Context
  const { name, canceled, entered, environmentsList, setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsList } = useEnvironmentPage();
  const { globalEnvironment, updateGlobalEnvironment, updateGlobalCluster, removeEnvironment } = useCameraConnection();

  // Delete an environment
  const handleDeleteEnvironment= (environment_name) => {

    // Remove environment from the list
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList);
      updatedList.remove(environment_name);
      return updatedList;
    });

    removeEnvironment(environment_name);

  }

  useEffect(() => {
    if (!environmentsList.isPresent(globalEnvironment)) {
      console.log("Environment no longer exists");
      updateGlobalEnvironment("");
      updateGlobalCluster("");
    }
  }, [environmentsList]);

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
      else if (environmentsList.isPresent(name)) {
        setError("Error: Environments must have unique names.");
        setEntered(false);
      }
      // Add the environment
      else {
        let temp_name = name;
        setEnvironmentsList(prevList => {
          const updatedList = new LinkedList();
          Object.assign(updatedList, prevList);
          if(!updatedList.isPresent(temp_name)) {
            updatedList.append(temp_name, 
                                    <ClusterEnvironmentProvider key={id} >
                                      <EnvironmentContainer handleDeleteEnvironment={handleDeleteEnvironment} environment_name={temp_name} />
                                    </ClusterEnvironmentProvider>); // Append new data
          }
          return updatedList;
        });
        if(globalEnvironment === "") {
          updateGlobalEnvironment(temp_name);
        }
        setId(id+1);
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