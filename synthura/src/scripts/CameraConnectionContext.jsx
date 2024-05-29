/* 

Description: stores the video frames associated with each cluster

*/

import React, { createContext, useContext, useState } from 'react'
import { LinkedList } from './LinkedList';

const CameraConnectionContext = createContext(null);

export const NameComponentProvider = ({ children }) => {

  const [connections, updateConnections] = useState(new Map());

  // const addConnection = (environmentID, clusterID, component) {

  // }

  return (
    <CameraConnectionContext.Provider value={{ connections }}>
      {children}
    </CameraConnectionContext.Provider>
  );

}

export const useNameComponent = () => {
  return useContext(CameraConnectionContext);
}
