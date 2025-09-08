// src/Components/Roles/Planner/StartWorkConfirmModal.tsx
import React from 'react';

interface StartWorkConfirmModalProps {
  stepName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const StartWorkConfirmModal: React.FC<StartWorkConfirmModalProps> = ({ stepName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Start Work</h3>
        <p className="text-gray-700 mb-6 text-center">Are you sure you want to start "{stepName}"?</p>

        <div className="flex justify-center gap-4 w-full">
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition hover:cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-[#00AEEF] text-white py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition hover:cursor-pointer"
            onClick={onConfirm}
          >
            Start Work
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartWorkConfirmModal;
