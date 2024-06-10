/* 

Description: React context to share cluster and environment state between components

*/

import React, { createContext, useContext, useState } from 'react'
import { LinkedList } from "./LinkedList"

const ClusterEnvironmentContext = createContext(null);

export const ClusterEnvironmentProvider = ({ children }) => {

  const [environment, setEnvironment] = useState('');
  const [clustersList, setClustersList] = useState(new LinkedList());

  return (
    <ClusterEnvironmentContext.Provider value={{ clustersList, environment, setClustersList, setEnvironment }}>
      {children}
    </ClusterEnvironmentContext.Provider>
  );

}

export const useClusterEnvironment = () => {
  return useContext(ClusterEnvironmentContext);
}