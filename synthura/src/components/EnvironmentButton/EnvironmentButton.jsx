/* 

Contributor(s): Owen Arnst

Description: This component is a button that represents an environment and manages its associated clusters

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/

import "./EnvironmentButton.css"

const EnvironmentButton = ( {handleDeleteEnvironment, id} ) => {

  return (
    <>
       <button className="environment-dropdown-btn">
          <svg id="close-env-icon" onClick={() => handleDeleteEnvironment(id)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
            0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
            32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
          <span>Environment #</span>
          <svg className="environment-dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 
            192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
      </button>
    </>
  )
}

export default EnvironmentButton

