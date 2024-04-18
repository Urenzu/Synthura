import "./tempStyles/EnvironmentSideBar.css"
import EnvironmentButton from "./EnvironmentButton"
import ClusterButton from "./ClusterButton"

const EnvironmentSideBar = () => {
  return (
    <section id="side-bar">
      <h2>Manage Environments</h2>
      <div className="environment">
        <EnvironmentButton />
        <ClusterButton />
      </div>
    </section>
  )
}

export default EnvironmentSideBar
