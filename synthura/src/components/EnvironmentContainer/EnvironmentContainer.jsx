/* 

Contributor(s): Owen Arnst

Description: This component contains a single environment. Separates environments and eases styling/event handling

Parent Component(s): EnvironmentSideBar

Child Component(s): EnvironmentButton, ClusterButton

*/

import { useState, useEffect } from "react"
import { LinkedList } from "../../scripts/LinkedList"
import EnvironmentButton from "../EnvironmentButton/EnvironmentButton"
import ClusterButton from "../ClusterButton/ClusterButton"
import { useEnvironmentPage } from "../../scripts/EnvironmentsPageContext";
import "./EnvironmentContainer.css"

const EnvironmentContainer = ( {env_id, handleDeleteEnvironment, environment_name} ) => {

  const [clustersList, setClustersList] = useState(new LinkedList());
  const [activeClusters, setActiveClusters] = useState([]);
  const [id, setId] = useState(1);
  const { active, name, canceled, entered, environmentsMap, setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsMap } = useEnvironmentPage();
  const [ addingCluster, setAddingCluster ] = useState(false);

  // Delete a cluster
  const handleDeleteCluster = (rem, cluster_name) => {
    setClustersList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
    setEnvironmentsMap(prevMap => {
      const updatedMap = new Map(prevMap); // Create a shallow copy of the previous map
      const updatedClusterList = updatedMap.get(environment_name).filter(item => item !== cluster_name); // Remove cluster name from map
      updatedMap.set(environment_name, updatedClusterList); // Set the updated array back into the map
      return updatedMap; // Return updated map
    })
  }

  // Add the cluster
  useEffect(() => {
    if (addingCluster) {
      if(canceled) {
        setCanceled(false);
        setAddingCluster(false);
        setActive(false);
        setName("");
      }
      else if (environmentsMap.get(environment_name).includes(name)) {
        setError("Error: Clusters in this environment must have unique names.");
        setEntered(false);
      }
      else {
        let temp_name = name;
        setClustersList(prevList => {
          const updatedList = new LinkedList();
          Object.assign(updatedList, prevList); // Copy previous state
          if(!updatedList.isPresent(id)) {
            updatedList.append(id, <ClusterButton key={id} handleDeleteCluster={handleDeleteCluster} id={id} environment_name={environment_name} cluster_name={temp_name} />); // Append new data
            setId(id+1);
          }
          return updatedList; // Return updated list
        });
        setEnvironmentsMap(prevMap => {
          const updatedMap = new Map(prevMap); // Create a shallow copy of the previous map
          if (environmentsMap.get(environment_name).includes(name)) {}
          else {
            updatedMap.get(environment_name).push(temp_name); // Append new data
          }
          return updatedMap; // Return updated map
        })
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
    setActiveClusters(clustersList.render());
  }, [clustersList]);

  return (
    <div className={"environment" + (active ? " active" : "") } >
      <EnvironmentButton id={env_id} handleDeleteEnvironment={handleDeleteEnvironment} environment_name={environment_name} />
      <div className="cluster">
        <div className="active-clusters" >
          {activeClusters}
        </div>
        <button className="add-cluster-btn" onClick={handleCreateCluster}>
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
