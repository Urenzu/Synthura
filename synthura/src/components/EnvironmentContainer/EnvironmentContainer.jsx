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
import "./EnvironmentContainer.css"

const EnvironmentContainer = ( {env_id, handleDeleteEnvironment} ) => {

  const [clustersList, setClustersList] = useState(new LinkedList());
  const [activeClusters, setActiveClusters] = useState([]);
  const [id, setId] = useState(1);

  // Delete a cluster
  const handleDeleteCluster = (rem) => {
    setClustersList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
  }

  // create a new cluster
  const handleCreateCluster = () => {
    setClustersList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      if(!updatedList.isPresent(id)) {
        updatedList.append(id, <ClusterButton key={id} handleDeleteCluster={handleDeleteCluster} id={id} />); // Append new data
        setId(id+1);
      }
      return updatedList; // Return updated list
    });
  }

  // renders updated column of clusters
  useEffect(() => { 
    setActiveClusters(clustersList.render());
  }, [clustersList]);

  return (
    <div className="environment" >
      <EnvironmentButton id={env_id} handleDeleteEnvironment={handleDeleteEnvironment} />
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
