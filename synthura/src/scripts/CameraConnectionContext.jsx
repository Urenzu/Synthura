/* 

Description: stores the video frames associated with each cluster

*/

import React, { createContext, useContext, useState } from 'react'
import { LinkedList } from "./LinkedList"

const CameraConnectionContext = createContext(null);

export const CameraConnectionProvider = ({ children }) => {

  const [globalEnvironment, updateGlobalEnvironment] = useState("");
  const [globalCluster, updateGlobalCluster] = useState("");
  const [connections, updateConnections] = useState(new Map());

  // Add an empty linked list for connections associated with a new environment and cluster
  const addEnvironmentCluster = (environment, cluster) => {
    const compositeKey = `${environment}:${cluster}`;
    updateConnections(prev => {
      const updatedConnections = new Map(prev);
      updatedConnections.set(compositeKey, new LinkedList());
      console.log(updatedConnections);
      return updatedConnections;
    });
  }

  // Remove all connections associated with an environment
  const removeEnvironment = (environment) => {
    updateConnections(prev => {
      const updatedConnections = new Map(prev);
      for (let key of updatedConnections.keys()) {
        if (key[0] === environment) {
          updatedConnections.delete(key);
        }
      }
      console.log(updatedConnections);
      return updatedConnections;
    });
  }

  // Convert the linked list of connections into an array
  const renderConnectionList = (key) => {
    const connectionsList = connections.get(key);
    return connectionsList.render();
  }

  const noConnections = () => {
    for (let key of connections.keys()) {
      if (connections.get(key).getSize() > 0) {
        return false;
      }
      else {
        return true;
      }
    }
  }

  return (
    <CameraConnectionContext.Provider value={{ connections, globalEnvironment, globalCluster, updateConnections, updateGlobalEnvironment, 
    updateGlobalCluster, renderConnectionList, addEnvironmentCluster, removeEnvironment, noConnections}}>
      {children}
    </CameraConnectionContext.Provider>
  );

}

export const useCameraConnection = () => {
  return useContext(CameraConnectionContext);
}