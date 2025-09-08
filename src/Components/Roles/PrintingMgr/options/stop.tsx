import React, { useState } from 'react';

const sidebarSections = [
  {
    title: 'Planning Details',
    items: ['New Job Started', 'Paper Store Details', 'Printing Details'],
    highlight: 'Printing Details',
  },
  {
    title: 'Production Details',
    items: ['Corrugation (Show only if any)', 'Flute Lamination (if any)', 'Flap Pasting'],
  },
  {
    title: 'QC Details',
    items: ['ABC'],
  },
  {
    title: 'Dispatch Details',
    items: ['ABC'],
  },
];

const StopScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleComplete = () => {
    if (!quantity.trim()) {
      setError('Please enter a quantity.');
      return;
    }
    setError('');
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[70vh]">
      {/* Sidebar/Table */}
      <aside className="w-full md:w-64 min-w-[220px] bg-transparent p-4 flex flex-col gap-4 md:sticky md:top-0 md:h-auto overflow-x-auto md:overflow-x-visible">
        {sidebarSections.map(section => (
          <div key={section.title}>
            <div className="bg-blue-100 rounded px-3 py-1 font-semibold text-sm mb-1">{section.title}</div>
            <div className="flex flex-col gap-1">
              {section.items.map(item => (
                <div
                  key={item}
                  className={
                    item === section.highlight
                      ? 'bg-[#F2F2F5] px-3 py-1 rounded text-black font-medium'
                      : 'px-3 py-1 text-black'
                  }
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </aside>
      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-2 md:p-0">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl flex flex-col items-center">
          <h2 className="text-lg font-semibold text-center mb-6">Printing Details</h2>
          <form className="w-full flex flex-col gap-6 items-center" onSubmit={e => { e.preventDefault(); handleComplete(); }}>
            <div className="w-full">
              <label className="block font-medium mb-1">Quantity</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder=""
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-medium py-3 px-4 rounded-lg transition duration-300 mt-2 text-base hover:cursor-pointer"
            >
              Complete work
            </button>
            <button
              type="button"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 mt-3 text-base hover:cursor-pointer"
              onClick={onBack}
            >
              Back
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StopScreen;
