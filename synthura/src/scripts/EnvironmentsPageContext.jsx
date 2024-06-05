/* 

Description: React context to share state between environment page and its children components

*/

import React, { createContext, useContext, useState } from 'react'
import { LinkedList } from "./LinkedList"

const EnvironmentsPageContext = createContext(null);

export const EnvironmentsPageProvider = ({ children }) => {

  const [prompt, setPrompt] = useState('');
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');
  const [canceled, setCanceled] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState(null);
  const [clustersList, setClustersList] = useState(new LinkedList());
  const [environmentsList, setEnvironmentsList] = useState(new LinkedList());

  return (
    <EnvironmentsPageContext.Provider value={{ prompt, active, name, canceled, entered, error, environmentsList, clustersList,
                                            setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsList, setClustersList }}>
      {children}
    </EnvironmentsPageContext.Provider>
  );

}

export const useEnvironmentPage = () => {
  return useContext(EnvironmentsPageContext);
}
