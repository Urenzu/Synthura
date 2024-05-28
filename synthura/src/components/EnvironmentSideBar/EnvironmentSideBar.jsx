/* 

Contributor(s): Owen Arnst

Description: This component is a sidebar that facilitates the management of environments and clusters.

Parent Component(s): EnvironmentPage

Child Component(s): EnvironmentContainer

*/

import "./EnvironmentSideBar.css"
import EnvironmentContainer from "../EnvironmentContainer/EnvironmentContainer"
import { LinkedList } from '../../scripts/LinkedList';
import { useState, useEffect } from 'react';
import { useNameComponent } from "../../scripts/NameComponentContext";

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);
  const { canceled, active, name, setCanceled, setName, setActive, setText } = useNameComponent();
  const [entered, setEntered] = useState(false);

  // Delete an environment
  const handleDeleteEnvironment= (rem) => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      updatedList.remove(rem); // Append new data
      return updatedList; // Return updated list
    });
  }

  useEffect(() => {
    if (!active && entered && !canceled) {
      let temp_name = name;
      setEnvironmentsList(prevList => {
        const updatedList = new LinkedList();
        Object.assign(updatedList, prevList); // Copy previous state
        if(!updatedList.isPresent(id)) {
          updatedList.append(id, <EnvironmentContainer key={id} handleDeleteEnvironment={handleDeleteEnvironment} env_id={id} environment_name={temp_name}/>); // Append new data
          setId(id+1);
        }
        return updatedList; // Return updated list
      });
      setName("");
      setEntered(false);
    }
    else if (canceled) {
      setCanceled(false);
      setEntered(false);
    }
  }, [active]);

  // create a new environment
  const handleCreateEnvironment = () => {
    setText("Enter Environment Name");
    setEntered(true);
    setActive(true);
  }

  // renders updated column of environments
  useEffect(() => { 
    setActiveEnvironments(environmentsList.render());
  }, [environmentsList]);

  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2>Manage Environments</h2>
        <div id="environments">
          {activeEnvironments}
        </div>
      <button id="add-environment-btn" onClick={handleCreateEnvironment} >Add Environment</button>
    </section>
  )
}

export default EnvironmentSideBar
