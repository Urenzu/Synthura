/* 

Description: React context to share state between environment page and its children components

*/

import React, { createContext, useContext, useState } from 'react'

const EnvironmentsPageContext = createContext(null);

export const EnvironmentsPageProvider = ({ children }) => {

  const [prompt, setPrompt] = useState('');
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');
  const [canceled, setCanceled] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState(null);
  const [environmentsMap, setEnvironmentsMap] = useState(new Map());

  return (
    <EnvironmentsPageContext.Provider value={{ prompt, active, name, canceled, entered, error, environmentsMap,
                                            setPrompt, setActive, setName, setCanceled, setEntered, setError, setEnvironmentsMap }}>
      {children}
    </EnvironmentsPageContext.Provider>
  );

}

export const useEnvironmentPage = () => {
  return useContext(EnvironmentsPageContext);
}
