import React from 'react';
import type { ReactNode } from 'react';
import { useTabContext } from '../../context/TabContext';

interface TabPanelProps {
  value: string;
  children: ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ value, children }) => {
  const contextValue = useTabContext();
  if (contextValue !== value) return null;
  return <div className="w-full rounded-lg text-gray-900 mt-4 p-4">{children}</div>;
};

export default TabPanel;