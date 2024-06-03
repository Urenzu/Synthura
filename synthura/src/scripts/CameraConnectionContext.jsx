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

  const addEnvironmentCluster = (environment, cluster) => {
    updateConnections(prev => {
      const updatedConnections = new Map(prev);
      updatedConnections.set([environment, cluster], new LinkedList());
      console.log(updatedConnections);
      return updatedConnections;
    });
  }

  const removeEnvironmentCluster = (environment, cluster) => {
    updateConnections(prev => {
      const updatedConnections = new Map(prev);
      updatedConnections.delete([environment, cluster]);
      console.log(updatedConnections);
      return updatedConnections;
    });
  }

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

  const renderConnectionList = (key) => {
    const connectionsList = connections.get(key);
    return connectionsList.render();
  }

  return (
    <CameraConnectionContext.Provider value={{ connections, globalEnvironment, globalCluster, updateConnections, updateGlobalEnvironment, 
    updateGlobalCluster, renderConnectionList, addEnvironmentCluster, removeEnvironmentCluster, removeEnvironment}}>
      {children}
    </CameraConnectionContext.Provider>
  );

}

export const useCameraConnection = () => {
  return useContext(CameraConnectionContext);
}
