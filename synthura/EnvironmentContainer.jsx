/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component contains a single environment. Separates environments and eases styling/event handling

Parent Component(s): EnvironmentSideBar

Child Component(s): EnvironmentButton, ClusterButton

*/

import { useState, useEffect } from "react"
import { LinkedList } from "../../scripts/LinkedList"
import EnvironmentButton from "../EnvironmentButton/EnvironmentButton"
import ClusterButton from "../ClusterButton/ClusterButton"
import "./EnvironmentContainer.css"

const EnvironmentContainer = ( {env_id, handleDeleteEnvironment, handleRenameEnvironment, EnvName = "Environment " + env_id, show_cluster=1, toggle_cluster} ) => {
  console.log("in EnvironmentContainer, env_id is", env_id, "EnvName is", EnvName)
  
  const [clusterList, setClusterList] = useState([]);
  const [id, setId] = useState(1);

  const ClusterNode = (id, name) => ({
    id,
    name,
    ClusterButton: <ClusterButton key={id} id={id} CluName = {name} handleDeleteCluster={handleDeleteCluster} handleRenameCluster={handleRenameCluster}/>,
  });

  // Delete a cluster
  const handleDeleteCluster= (idToRemove) => {
    setClusterList(prevList => {
      if (!prevList.some((cluster) => cluster.id === idToRemove)) {
        console.error(`Cluster with ID ${idToRemove} not found`);
      } else {
        console.log("Cluster deleted successfully");
      }

      const updatedList = prevList.filter((cluster) => cluster.id !== idToRemove);
      
      return updatedList; // Return updated list
    });
  }


  // create a new cluster
  const handleCreateCluster = () => {
    setClusterList(prevList => {
      setId(id+1);
      const newNode = ClusterNode(id, "ARRAY Cluster " + id);
      console.log("newNode is", newNode)
      console.log("updatedList is", [...prevList, newNode])
      return [...prevList, newNode]; // Return updated list
    });
  }

  // Rename an cluster
  const handleRenameCluster= (idToRename, NewName) => {
    setClusterList(prevList => {
      const updatedList = [];
      Object.assign(updatedList, prevList); // Copy previous state
      let ClusterToChange = updatedList.find((cluster) => cluster.id === idToRename);

      if (ClusterToChange) {
        ClusterToChange.name = NewName
        console.log("Cluster Name changed successfully!")
      } else {
        console.error(`Cluster with ID ${IdToRemove} not found`);
      }
      return updatedList; // Return updated list
    });
  }

  return (
    <div className="environment" >
      <EnvironmentButton id={env_id} handleDeleteEnvironment={handleDeleteEnvironment} handleRenameEnvironment={handleRenameEnvironment} EnvName={EnvName} show_cluster={show_cluster} toggle_cluster={toggle_cluster}/>
      {show_cluster &&
        <>
        <div className="cluster">
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {clusterList.length > 0 && (
              clusterList.map((cluster) => (
                <li key={cluster.id}>
                  <ClusterButton key={cluster.id} id={cluster.id} CluName = {cluster.name} handleDeleteCluster={handleDeleteCluster} handleRenameCluster={handleRenameCluster}/>
                </li>
              ))
            )}
          </ul>
      </div>
      <button className="add-cluster-btn" onClick={handleCreateCluster}>
          <svg id="add-cluster-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 
            32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
          </svg>
        </button>
        </>}
    </div>
  )
}

export default EnvironmentContainer