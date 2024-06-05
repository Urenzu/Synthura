/* 

Contributor(s): Owen Arnst

Description: This component contains a single environment. Separates environments and eases styling/event handling

Parent Component(s): EnvironmentSideBar

Child Component(s): EnvironmentButton, ClusterButton

*/

import { useState, useEffect, useRef } from "react"
import { LinkedList } from "../../scripts/LinkedList"
import EnvironmentButton from "../EnvironmentButton/EnvironmentButton"
import ClusterButton from "../ClusterButton/ClusterButton"
import { useEnvironmentPage } from "../../scripts/EnvironmentsPageContext";
import { useCameraConnection } from "../../scripts/CameraConnectionContext";
import { useClusterEnvironment } from "../../scripts/ClusterEnvironmentContext";
import "./EnvironmentContainer.css"

const EnvironmentContainer = ( {env_id, handleDeleteEnvironment, environment_name} ) => {

  // Local State 
  const [ activeClusters, setActiveClusters ] = useState([]);
  const [ id, setId ] = useState(1);
  const [ addingCluster, setAddingCluster ] = useState(false);
  const initializedRef = useRef(false);

  // Context
  const { active, name, canceled, entered, setPrompt, setActive, setName, setCanceled, setEntered, setError , clustersList, setClustersList} = useEnvironmentPage();
  const { connections, updateGlobalEnvironment, updateGlobalCluster, updateConnections, addEnvironmentCluster, globalCluster, globalEnvironment  } = useCameraConnection();
  const { environment, setEnvironment } = useClusterEnvironment();

  // Update environment name
  useEffect(() => {
    if (!initializedRef.current) {
      setEnvironment(environment_name);
      initializedRef.current = true;
    }
  }, []);

  // Delete a cluster
  const handleDeleteCluster = (cluster_name) => {
    
    // Remove cluster from the list
    setClustersList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList);
      updatedList.remove(cluster_name);
      return updatedList;
    });

    console.log(connections);
    console.log(environment, cluster_name)
    updateConnections(prev => {
      const updatedConnections = new Map(prev);
      const compositeKey = `${environment}:${cluster_name}`;
      updatedConnections.delete(compositeKey); 
      console.log(updatedConnections);
      return updatedConnections;
    });

  }

  useEffect(() => {
    // Check if this component is adding a cluster
    if (addingCluster) {
      // Cancel the operation
      if(canceled) {
        setCanceled(false);
        setAddingCluster(false);
        setActive(false);
        setName("");
      }
      // Check if the cluster name is already in use
      else if (clustersList.isPresent(name)) {
        setError("Error: Clusters in this environment must have unique names.");
        setEntered(false);
      }
      // Add the cluster
      else {
        let temp_name = name;
        console.log(environment);
        updateGlobalEnvironment(environment);
        updateGlobalCluster(temp_name);
        addEnvironmentCluster(environment, temp_name);
        // Add the cluster to the list
        setClustersList(prevList => {
          const updatedList = new LinkedList();
          Object.assign(updatedList, prevList);
          if(!updatedList.isPresent(temp_name)) {
            updatedList.append(temp_name, <ClusterButton key={id} handleDeleteCluster={handleDeleteCluster} cluster_name={temp_name} />); // Append new data
          }
          return updatedList;
        });
        setId(id+1);
        setEntered(false);
        setActive(false);
        setAddingCluster(false);
        setName("");
      }
    }
  }, [entered, canceled]);

  // prompt user to enter cluster name
  const handleCreateCluster = () => {
    setPrompt("Enter Cluster Name");
    setActive(true);
    setAddingCluster(true);
  }

  // renders updated column of clusters
  useEffect(() => { 
    if(environment === globalEnvironment && !clustersList.isPresent(globalCluster)) {
      console.log("Cluster no longer exists");
      updateGlobalCluster("");
    }
    setActiveClusters(clustersList.render());
  }, [clustersList]);

  return (
    <div className={"environment" + (active ? " active" : "") } >
      <EnvironmentButton id={env_id} handleDeleteEnvironment={handleDeleteEnvironment} />
      <div className="cluster">
        <div className="active-clusters" >
          {activeClusters}
        </div>
        <button className="add-cluster-btn" onClick={handleCreateCluster} >
            <svg id="add-cluster-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 
              32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
            </svg>
        </button>
      </div>
    </div>
  )
}

export default EnvironmentContainer