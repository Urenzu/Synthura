/* 

Description: Reusable component template for prompting user to name a component

*/

import React, { createContext, useContext, useState } from 'react'

const NameComponentContext = createContext(null);

export const NameComponentProvider = ({ children }) => {

  const [text, setText] = useState('Enter Name');
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');
  const [canceled, setCanceled] = useState(false);

  return (
    <NameComponentContext.Provider value={{ canceled, name, active, text,  setCanceled, setName, setActive, setText }}>
      {children}
    </NameComponentContext.Provider>
  );

}

export const useNameComponent = () => {
  return useContext(NameComponentContext);
}
