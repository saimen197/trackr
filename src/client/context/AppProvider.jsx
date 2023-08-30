import React, { useReducer } from 'react';
import { AppContext } from './Context';
import { initialState, reducer } from './state';

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};