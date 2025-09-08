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

const ReadyDispatchForm: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [form, setForm] = useState({
    boxes: '',
    dispatchNos: '',
    date: '',
    balanceQty: '',
    oprName: '',
    remarks: '',
    qcCheckBy: '',
    shift: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.boxes || !form.dispatchNos || !form.date || !form.balanceQty || !form.oprName || !form.qcCheckBy || !form.shift) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[70vh]">
      {/* Sidebar/Table */}
      <aside className="w-full md:w-64 min-w-[220px] bg-transparent p-4 flex flex-col gap-4 md:sticky md:top-0 md:h-auto overflow-x-auto md:overflow-x-visible rounded-l-2xl">
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
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl flex flex-col items-center relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
            onClick={onBack}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold text-center mb-6">Dispatch Form Details</h2>
          <form className="w-full flex flex-col gap-6 items-center" onSubmit={handleSubmit}>
            <div className="w-full">
              <label className="block font-medium mb-1">No. of boxes</label>
              <select
                name="boxes"
                value={form.boxes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">Dispatch No’s</label>
              <input
                type="text"
                name="dispatchNos"
                value={form.dispatchNos}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">Balance Qty</label>
              <input
                type="number"
                name="balanceQty"
                value={form.balanceQty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">OPR Name</label>
              <input
                type="text"
                name="oprName"
                value={form.oprName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">Remarks</label>
              <input
                type="text"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">QC Check By</label>
              <input
                type="text"
                name="qcCheckBy"
                value={form.qcCheckBy}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div className="w-full">
              <label className="block font-medium mb-1">Shift</label>
              <input
                type="text"
                name="shift"
                value={form.shift}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-medium py-3 px-4 rounded-lg transition duration-300 mt-2 text-base hover:cursor-pointer"
            >
              Submit
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

export default ReadyDispatchForm;
