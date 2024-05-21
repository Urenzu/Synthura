/* 

Contributor(s): Owen Arnst

Description: This component represents a cluster of cameras within an environment.

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/

import "./ClusterButton.css"

const ClusterButton = ( {id, handleDeleteCluster} ) => {
  return (
    <button className="cluster-btn">
        <svg id="close-cluster-icon" onClick={() => handleDeleteCluster(id)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
        </svg>
        <span></span>
        Cluster #
        <svg className="cluster-camera-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 
            64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 
            32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
        </svg>
    </button>
  )
}

export default ClusterButton
