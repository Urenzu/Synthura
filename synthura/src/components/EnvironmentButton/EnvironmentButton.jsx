/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component is a button that represents an environment and manages its associated clusters

Parent Component(s): EnvironmentContainer

Child Component(s): none

*/

import "./EnvironmentButton.css"

const EnvironmentButton = ( {handleDeleteEnvironment, id, EnvName} ) => {
  console.log("in EnvironmentButton, id is", id, "EnvName is", EnvName)

  return (
    <>
       <button className="environment-dropdown-btn">
          <svg className="environment-dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 
            192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
          <span>{EnvName}</span>
          <svg id="three-dots" onClick = {() => handleDeleteEnvironment(id)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="16" cy="12" r=".5"/>
            <circle cx="18" cy="12" r=".5"/>
            <circle cx="20" cy="12" r=".5" />
          </svg>


      </button>
    </>
  )
}

export default EnvironmentButton

