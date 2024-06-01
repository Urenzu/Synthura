/* 

Contributor(s): Owen Arnst

Description: This component is a button that represents an environment and manages its associated clusters

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/

import "./EnvironmentButton.css"
import { useState, useRef, useEffect } from "react"
import { useEnvironmentPage } from "../../scripts/EnvironmentsPageContext";
import { useCameraConnection } from "../../scripts/CameraConnectionContext";
import { useClusterEnvironment } from "../../scripts/ClusterEnvironmentContext";

const EnvironmentButton = ( {handleDeleteEnvironment, id} ) => {

  // Local state
  const [ renamingEnvironment, setRenamingEnvironment ] = useState(false);
  const [ toolTip, setToolTip ] = useState(false);
  const timeoutRef = useRef(null);

  // Context
  const { globalEnvironment, updateGlobalEnvironment } = useCameraConnection();
  const { name, canceled, entered, environmentsMap, setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsMap } = useEnvironmentPage();
  const { environment, setEnvironment } = useClusterEnvironment();

  useEffect(() => {
    // Check if this component is renaming an environment
    if (renamingEnvironment) {
      // Cancel the operation if the user cancels
      if(canceled) {
        setCanceled(false);
        setRenamingEnvironment(false);
        setActive(false);
        setName("");
      }
      // Cancel the operation if the user enters the same name
      else if (name === environment) {
        setEntered(false);
        setRenamingEnvironment(false);
        setActive(false);
        setName("");
      }
      // Check if the new name is already in use
      else if (environmentsMap.get(name)) {
        setError("Error: Environments in this environment must have unique names.");
        setEntered(false);
      }
      // Rename the environment
      else {
        let temp_name = name;
        setEnvironmentsMap(prevMap => {
          const updatedMap = new Map(prevMap);
          if(updatedMap.has(environment)) {
            const clusterList = updatedMap.get(environment);
            updatedMap.set(temp_name, clusterList);
            updatedMap.delete(environment);
          }
          console.log(updatedMap);
          return updatedMap;
        })
        if(environment === globalEnvironment) {
          updateGlobalEnvironment(temp_name);
        }
        setEnvironment(temp_name);
        setEntered(false);
        setActive(false);
        setRenamingEnvironment(false);
        setName("");
      }
    }
  }, [entered, canceled]);
  
    // prompt user to new environment name
    const handleRename = () => {
      setPrompt("Enter New Environment Name");
      setActive(true);
      setRenamingEnvironment(true);
    }

  const handleMouseOver = () => {
    timeoutRef.current = setTimeout(() => {
      setToolTip(true);
    }, 1000);
  }

  const handleMouseOut = () => {
    clearTimeout(timeoutRef.current);
    setToolTip(false);
  }

  return (
    <>
       <button className="environment-dropdown-btn">
          <svg id="close-env-icon" onClick={() => handleDeleteEnvironment(id, environment)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
          <span></span>
          <span>{environment}</span>
          {toolTip && <span className="tooltip">Rename</span>}
          <svg className="elipses-icon" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={handleRename} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/>
          </svg>
          <svg className="environment-dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 
            192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
      </button>
    </>
  )
}

export default EnvironmentButton

