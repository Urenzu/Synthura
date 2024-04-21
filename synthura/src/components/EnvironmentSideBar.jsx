import "./tempStyles/EnvironmentSideBar.css"
import EnvironmentContainer from "./EnvironmentContainer"
import { LinkedList } from '../scripts/LinkedList';
import { useState, useEffect } from 'react';

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);

  // Delete an environment
  const handleDeleteEnvironment= (rem) => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
  }

  // create a new environment
  const handleCreateEnvironment = () => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      if(!updatedList.isPresent(id)) {
        updatedList.append(id, <EnvironmentContainer key={id} handleDeleteEnvironment={handleDeleteEnvironment} id={id} />); // Append new data
        setId(id+1);
      }
      return updatedList; // Return updated list
    });
  }

  // renders updated column of environments
  useEffect(() => { 
    setActiveEnvironments(environmentsList.render());
  }, [environmentsList]);

  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2>Manage Environments</h2>
        <div className="environment">
          {activeEnvironments}
        </div>
      <button id="add-environment-btn" onClick={handleCreateEnvironment} >Add Environment</button>
    </section>
  )
}

export default EnvironmentSideBar
