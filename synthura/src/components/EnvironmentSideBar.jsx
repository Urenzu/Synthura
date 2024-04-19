import "./tempStyles/EnvironmentSideBar.css"
import EnvironmentButton from "./EnvironmentButton"
import ClusterButton from "./ClusterButton"

const EnvironmentSideBar = ({showSideBar}) => {

  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2>Manage Environments</h2>
      <div className="environment">
        <EnvironmentButton />
        <ClusterButton />
      </div>
      <button id="add-environment-btn">Add Environment</button>
    </section>
  )
}

export default EnvironmentSideBar
