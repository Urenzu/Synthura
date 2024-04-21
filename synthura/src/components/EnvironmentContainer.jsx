/* 

Contributor(s): Owen Arnst

Description: This component contains a single environment. Separates environments and eases styling/event handling

Parent Component(s): EnvironmentSideBar

*/

import EnvironmentButton from "./EnvironmentButton"
import ClusterButton from "./ClusterButton"
import "./tempStyles/EnvironmentContainer.css"

const EnvironmentContainer = ( {id, handleDeleteEnvironment} ) => {
  return (
    <div>
      <EnvironmentButton id={id} handleDeleteEnvironment={handleDeleteEnvironment} />
      <div className="cluster">
        <ClusterButton />
      </div>
    </div>
  )
}

export default EnvironmentContainer
