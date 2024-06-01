/* 

Description: stores the video frames associated with each cluster

*/

import React, { createContext, useContext, useState } from 'react'

const CameraConnectionContext = createContext(null);

export const CameraConnectionProvider = ({ children }) => {

  const [globalEnvironment, updateGlobalEnvironment] = useState("");
  const [globalCluster, updateGlobalCluster] = useState("");
  const [connections, updateConnections] = useState(new Map());

  return (
    <CameraConnectionContext.Provider value={{ connections, globalEnvironment, globalCluster, updateConnections, updateGlobalEnvironment, updateGlobalCluster }}>
      {children}
    </CameraConnectionContext.Provider>
  );

}

export const useCameraConnection = () => {
  return useContext(CameraConnectionContext);
}
