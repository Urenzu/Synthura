/* 

Contributor(s): Owen Arnst

Description: This component contains a single environment. Separates environments and eases styling/event handling

Parent Component(s): EnvironmentSideBar

Child Component(s): EnvironmentButton, ClusterButton

*/

import { useState } from "react"
import { LinkedList } from "../../scripts/LinkedList"
import EnvironmentButton from "../EnvironmentButton/EnvironmentButton"
import ClusterButton from "../ClusterButton/ClusterButton"
import "./EnvironmentContainer.css"

const EnvironmentContainer = ( {id, handleDeleteEnvironment} ) => {

  const [clustersList, setClustersList] = useState(new LinkedList());
  const [activeClusters, setActiveClusters] = useState([]);

  return (
    <div>
      <EnvironmentButton id={id} handleDeleteEnvironment={handleDeleteEnvironment} />
      <div className="cluster">
        {activeClusters}
        <button className="add-cluster-btn">Add Cluster</button>
      </div>
    </div>
  )
}

export default EnvironmentContainer
