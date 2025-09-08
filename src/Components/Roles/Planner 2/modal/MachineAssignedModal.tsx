// src/Components/Roles/Planner/MachineAssignedModal.tsx
import React, { useState, useEffect } from 'react';
import {type Machine } from '../Types/job.ts'; // Adjust path as needed

interface MachineAssignedModalProps {
  currentMachine: Machine | null;
  onSelect: (machine: Machine) => void;
  onClose: () => void;
}

const MachineAssignedModal: React.FC<MachineAssignedModalProps> = ({ currentMachine, onSelect, onClose }) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(currentMachine?.id || null);

  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Authentication token not found. Please log in.');
        }

        const response = await fetch('https://nrc-backend-his4.onrender.com/api/machines?', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch machines: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setMachines(data.data);
        } else {
          setError('Unexpected API response format for machines.');
        }
      } catch (err) {
        setError(`Error fetching machines: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error("Machine fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  const groupedMachines = machines.reduce((acc, machine) => {
    if (!acc[machine.machineType]) {
      acc[machine.machineType] = [];
    }
    acc[machine.machineType].push(machine);
    return acc;
  }, {} as Record<string, Machine[]>);

  const handleSave = () => {
    const machineToSave = machines.find(m => m.id === selectedMachineId);
    if (machineToSave) {
      onSelect(machineToSave);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Select Machines</h2>
          <p className="text-gray-500 text-center mb-6">Select the machines to assign the work:</p>

          {loading && <div className="text-center py-4">Loading machines...</div>}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

          {!loading && !error && Object.keys(groupedMachines).length === 0 && (
            <p className="text-gray-500 text-center py-4">No machines found.</p>
          )}

          {!loading && !error && Object.entries(groupedMachines).map(([type, machinesOfType]) => (
            <div key={type} className="w-full mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{type}</h3>
              <div className="space-y-3">
                {machinesOfType.map(machine => (
                  <label key={machine.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="machine"
                      value={machine.id}
                      checked={selectedMachineId === machine.id}
                      onChange={() => setSelectedMachineId(machine.id)}
                      className="form-radio h-5 w-5 text-[#00AEEF] border-gray-300 focus:ring-[#00AEEF]"
                    />
                    <div className="ml-3">
                      <span className="block text-base font-medium text-gray-800">{machine.machineCode} - {machine.description}</span>
                      <span className="block text-sm text-gray-500">Status: {machine.status}</span>
                      {/* You might want to show assigned jobs here if available */}
                      {/* <span className="block text-xs text-gray-400">Currently assigned to: {machine.jobs.map(j => j.id).join(', ')}</span> */}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md mt-6"
            disabled={!selectedMachineId} // Disable if no machine is selected
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineAssignedModal;
