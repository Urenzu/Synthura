/* 

Contributor(s): Owen Arnst and Githika Annapureddy

Description: This component is a sidebar that facilitates the management of environments and clusters.

Parent Component(s): EnvironmentPage

Child Component(s): EnvironmentContainer

*/

import "./EnvironmentSideBar.css"
import EnvironmentContainer from "../EnvironmentContainer/EnvironmentContainer"
import { LinkedList } from '../../scripts/LinkedList';
import { useState, useEffect } from 'react';

const EnvironmentSideBar = ({showSideBar}) => {

  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());
  const [activeEnvironments, setActiveEnvironments] = useState([]);
  const [id, setId] = useState(1);

  const EnvironmentNode = (id, name) => ({
    id,
    name,
    EnvironmentContainer: <EnvironmentContainer key={id} env_id={id} EnvName = {name} handleDeleteEnvironment={handleDeleteEnvironment} />,
  });
  

  // Delete an environment
  const handleDeleteEnvironment= (IdToRemove) => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state

      let curr = updatedList.head
      let prev = null
      let found = 0
      while (curr) {
        if (curr.id === IdToRemove){
          found = 1
          //manually remove
          if (prev) {
            prev.next = curr.next;
          } else {
            updatedList.head = curr.next; // Update head if deleting first node
          }
          break
        } 
        prev = curr
        curr = curr.next
      }
      
      // Remove specified data. Should never say not found but extra check for extra precaution
      if (found === 0) {
        console.error(`Environment with ID ${IdToRemove} not found`);
      } else {
        console.log("deleted successfully")
      }
      
      return updatedList; // Return updated list
    });
  }

  // create a new environment
  const handleCreateEnvironment = () => {
    setEnvironmentsList(prevList => {
      const updatedList = new LinkedList();
      Object.assign(updatedList, prevList); // Copy previous state
      //key is for id in environmentsList, env_id id for EnvironmentContainer
      const newNode = EnvironmentNode(id, "TEST2 Environment " + id);
      updatedList.append(newNode);
      console.log("newNode is", newNode)
      //updatedList.append(id, <EnvironmentContainer key={id} handleDeleteEnvironment={handleDeleteEnvironment} env_id={id} />); // Append new data
      setId(id+1);
      console.log("updatedList is", updatedList)
      return updatedList; // Return updated list
    });
  }

  // Rename an environment
  // const handleRenameEnvironment= (IdRename, NewName) => {
  //   setEnvironmentsList(prevList => {
  //     const updatedList = new LinkedList();
  //     Object.assign(updatedList, prevList); // Copy previous state

  //     const EnvToChange = updatedList.find(environment => environment.id === IdToRemove)
      
  //     // Remove specified data. should awlays exist, extra check for extra precaution
  //     if (EnvToChange) {
  //       // Remove the environment from the list
  //     } else {
  //       console.error(`Environment with ID ${IdToRemove} not found`);
  //     }

  //     return updatedList; // Return updated list
  //   });
  // }

  // renders updated column of environments
  // useEffect(() => { 
  //   setActiveEnvironments(environmentsList.render());
  // }, [environmentsList]);

  return (
    <section id="side-bar" className={showSideBar ? "show-side-bar" : "hide-side-bar"} >
      <h2 style={{ marginTop: "50px" }}>Manage Environments</h2>
        <div className="environment">
          <ul>
            {environmentsList.head && ( // Check if there's a head node (data)
              // Iterate through the linked list nodes
              let currNode = environmentsList.head;
              while (currNode) {
                <li key={currNode.id}>
                  {/* Render the EnvironmentContainer component from the node */}
                  <currNode.EnvironmentContainer />
                </li>
                currNode = currNode.next; // Move to the next node
              }
            )}
          </ul>
        </div>
      <button id="add-environment-btn" onClick={handleCreateEnvironment} >Add Environment</button>
    </section>
  );
}

export default EnvironmentSideBar