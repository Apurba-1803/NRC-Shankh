// src/Components/Roles/Planner/AddStepsModal.tsx
import React, { useState } from 'react';
import { type JobStep } from '../Types/job.ts'; // Adjust path as needed

interface AddStepsModalProps {
  currentSteps: JobStep[];
  onSelect: (steps: JobStep[]) => void;
  onClose: () => void;
}

const allStepsOptions: { stepName: string; description: string }[] = [
  { stepName: 'Paper Store', description: 'Responsible : Store Manager, Inventory Officer' },
  { stepName: 'Printing', description: 'Responsible : Print Operator, Print Supervisor, Quality Inspector' },
  { stepName: 'Corrugation', description: 'Responsible : Corrugation Operator, Line Supervisor' },
  { stepName: 'Flute Lamination', description: 'Responsible : Lamination Operator, Machine Operator' },
  { stepName: 'Punching', description: 'Responsible : Punching Operator' },
  { stepName: 'Flap Pasting', description: 'Responsible : Pasting Operator, Assembly Worker' },
  { stepName: 'Quality Control', description: 'Responsible : QC Inspector, Quality Manager' },
  { stepName: 'Dispatch', description: 'Responsible : Dispatch Officer, Logistics Coordinator' },
  { stepName: 'Die Cutting', description: 'Responsible : Dispatch Officer, Logistics Coordinator' }, // Duplicated in screenshot, keeping for now
];

const AddStepsModal: React.FC<AddStepsModalProps> = ({ currentSteps, onSelect, onClose }) => {
  const [selectedSteps, setSelectedSteps] = useState<JobStep[]>(currentSteps);

  // Removed 'description' parameter as it's not directly used in this function's logic
  const handleCheckboxChange = (stepName: string) => {
    setSelectedSteps(prev => {
      const exists = prev.some(step => step.stepName === stepName);
      if (exists) {
        return prev.filter(step => step.stepName !== stepName);
      } else {
        // Assign a dummy stepNo. machineDetail will be updated later or by backend.
        // For now, machineDetail can be an empty string.
        return [...prev, { stepNo: prev.length + 1, stepName, machineDetail: '' }];
      }
    });
  };

  const handleSave = () => {
    onSelect(selectedSteps);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Select Work Steps</h2>
          <p className="text-gray-500 text-center mb-6">Select the work steps to assign (Multiple selection allowed):</p>

          <div className="w-full space-y-4">
            {allStepsOptions.map(option => (
              <label key={option.stepName} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedSteps.some(step => step.stepName === option.stepName)}
                  onChange={() => handleCheckboxChange(option.stepName)} // Removed description from here
                  className="form-checkbox h-5 w-5 text-[#00AEEF] border-gray-300 focus:ring-[#00AEEF] rounded"
                />
                <div className="ml-3">
                  <span className="block text-base font-medium text-gray-800">{option.stepName}</span>
                  <span className="block text-sm text-gray-500">{option.description}</span>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStepsModal;
