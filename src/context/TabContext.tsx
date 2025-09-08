import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const TabContext = createContext<string | undefined>(undefined);

export const useTabContext = () => useContext(TabContext);

interface TabProviderProps {
  value: string;
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ value, children }) => (
  <TabContext.Provider value={value}>{children}</TabContext.Provider>
);