/* 

Description: React context to share cluster and environment state between components

*/

import React, { createContext, useContext, useState } from 'react'

const ClusterEnvironmentContext = createContext(null);

export const ClusterEnvironmentProvider = ({ children }) => {

  const [environment, setEnvironment] = useState('');

  return (
    <ClusterEnvironmentContext.Provider value={{ environment, setEnvironment }}>
      {children}
    </ClusterEnvironmentContext.Provider>
  );

}

export const useClusterEnvironment = () => {
  return useContext(ClusterEnvironmentContext);
}