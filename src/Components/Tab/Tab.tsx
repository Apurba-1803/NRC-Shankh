import React from 'react';

interface TabProps {
  label: string;
  value: string;
  selected?: boolean;
  onChange: (value: string) => void;
}

const Tab: React.FC<TabProps> = ({ label, value, selected, onChange }) => (
  <button
    onClick={() => onChange(value)}
    className={`mx-2 px-2 py-1 text-sm font-medium transition-colors
      ${selected ? 'text-[#00AEEF] font-semibold underline underline-offset-8' : 'text-gray-700 hover:text-[#00AEEF]'}
      bg-transparent border-none outline-none hover:cursor-pointer
    `}
    style={{ background: 'none' }}
  >
    {label}
  </button>
);

export default Tab;