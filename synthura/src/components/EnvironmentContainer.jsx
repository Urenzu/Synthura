/* 

Contributor(s): Owen Arnst

Description: This component contains a single environment. Separates environments and eases styling/event handling

Parent Component(s): EnvironmentSideBar

Child Component(s): EnvironmentButton, ClusterButton

*/

import EnvironmentButton from "./EnvironmentButton"
import ClusterButton from "./ClusterButton"
import "./tempStyles/EnvironmentContainer.css"

const EnvironmentContainer = ( {id, handleDeleteEnvironment} ) => {

  const [clustersList, setClustersList] = useState(new LinkedList());
  const [activeClusters, setActiveClusters] = useState([]);

  return (
    <div>
      <EnvironmentButton id={id} handleDeleteEnvironment={handleDeleteEnvironment} />
      <div className="cluster">
        {activeClusters}
      </div>
    </div>
  )
}

export default EnvironmentContainer
