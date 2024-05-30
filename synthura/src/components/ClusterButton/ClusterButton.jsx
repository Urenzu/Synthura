/* 

Contributor(s): Owen Arnst

Description: This component represents a cluster of cameras within an environment.

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/

import "./ClusterButton.css"
import { useState, useEffect, useRef } from "react"
import { useEnvironmentPage } from "../../scripts/EnvironmentsPageContext";

const ClusterButton = ( {id, handleDeleteCluster, cluster_name, environment_name } ) => {

  const { name, canceled, entered, environmentsMap, setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsMap } = useEnvironmentPage();
  const [ renamingCluster, setRenamingCluster ] = useState(false);
  const [ currentClusterName, setCurrentClusterName ] = useState(cluster_name);
  const [ toolTip, setToolTip ] = useState(false);
  const timeoutRef = useRef(null);

  // Add the cluster
  useEffect(() => {
    if (renamingCluster) {
      if(canceled) {
        setCanceled(false);
        setRenamingCluster(false);
        setActive(false);
        setName("");
      }
      else if (name === currentClusterName) {
        setEntered(false);
        setActive(false);
        setRenamingCluster(false);
        setName("");
      }
      else if (environmentsMap.get(environment_name).includes(name)) {
        setError("Error: Clusters in this environment must have unique names.");
        setEntered(false);
      }
      else {
        let temp_name = name;
        setEnvironmentsMap(prevMap => {
          const updatedMap = new Map(prevMap); // Create a shallow copy of the previous map
          const updatedClusterList = updatedMap.get(environment_name).map(item => {
            if (item === currentClusterName) {
              return temp_name;
            }
            return item;
          });
          updatedMap.set(environment_name, updatedClusterList); // Set the updated array back into the map
          return updatedMap; // Return updated map
        })
        setCurrentClusterName(temp_name);
        setEntered(false);
        setActive(false);
        setRenamingCluster(false);
        setName("");
      }
    }
  }, [entered, canceled]);

  // prompt user to enter cluster name
  const handleRename = () => {
    setPrompt("Enter New Cluster Name");
    setActive(true);
    setRenamingCluster(true);
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
    <button className="cluster-btn">
        <svg className="close-cluster-icon" onClick={() => handleDeleteCluster(id, cluster_name)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
        </svg>
        <span></span>
        {currentClusterName}
        {toolTip && <span className="tooltip">Rename</span>}
        <svg className="elipses-icon" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={handleRename} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/>
        </svg>
        <svg className="cluster-camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 
            64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 
            32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
        </svg>
    </button>
  )
}

export default ClusterButton
