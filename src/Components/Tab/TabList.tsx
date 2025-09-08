import React from 'react';
import type { ReactNode } from 'react';

interface TabListProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  showTabs?: boolean;
  direction?: 'horizontal' | 'vertical'; // Add this prop
}

const TabList: React.FC<TabListProps> = ({ 
  value, 
  onChange, 
  children, 
  showTabs = true,
  direction = 'horizontal' // Default to horizontal
}) => {
  if (!showTabs) return null;
  
  const containerClasses = direction === 'vertical' 
    ? "flex flex-col gap-2 w-full" // Vertical layout
    : "flex-1 flex justify-center items-center overflow-x-auto whitespace-nowrap"; // Horizontal layout
  
  return (
    <div className={containerClasses}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              selected: (child as React.ReactElement<any>).props.value === value,
              onChange,
            })
          : child
      )}
    </div>
  );
};

export default TabList;