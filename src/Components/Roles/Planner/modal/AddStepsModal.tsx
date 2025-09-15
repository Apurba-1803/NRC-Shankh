// src/Components/Roles/Planner/AddStepsModal.tsx
import React, { useState , useEffect} from 'react';
import { type JobStep } from '../Types/job.ts'; // Adjust path as needed
import {type Machine } from '../Types/job.ts';

interface AddStepsModalProps {
  currentSteps: JobStep[];
  selectedMachines: Machine[]; // Add this to pass current machines
  onSelect: (steps: JobStep[], machines: Machine[]) => void; // Return both
  onClose: () => void;
}

const allStepsOptions: { stepName: string; description: string }[] = [
  { stepName: 'PaperStore', description: 'Responsible : Store Manager, Inventory Officer' },
  { stepName: 'PrintingDetails', description: 'Responsible : Print Operator, Print Supervisor, Quality Inspector' },
  { stepName: 'Corrugation', description: 'Responsible : Corrugation Operator, Line Supervisor' },
  { stepName: 'FluteLaminateBoardConversion', description: 'Responsible : Lamination Operator, Machine Operator' },
  { stepName: 'Punching', description: 'Responsible : Punching Operator' },
  { stepName: 'SideFlapPasting', description: 'Responsible : Pasting Operator, Assembly Worker' },
  { stepName: 'QualityDept', description: 'Responsible : QC Inspector, Quality Manager' },
  { stepName: 'DispatchProcess', description: 'Responsible : Dispatch Officer, Logistics Coordinator' },
  { stepName: 'Die Cutting', description: 'Responsible : Dispatch Officer, Logistics Coordinator' },
];

const STEP_TO_MACHINE_MAPPING: Record<string, string[]> = {
  // Steps with machines
  'SideFlapPasting': ['auto flap ', 'manual fi'],
  'Punching': ['auto pund', 'manual pu'],
  'FluteLaminateBoardConversion': ['flute lam'],
  'Corrugation': ['corrugatic'],
  'PrintingDetails': ['printing'],
  
  // Steps without machines (no machine assignment needed)
  'PaperStore': [],
  'QualityDept': [],
  'DispatchProcess': [],
  'Die Cutting': []
};


const AddStepsModal: React.FC<AddStepsModalProps> = ({ 
  currentSteps, 
  selectedMachines, 
  onSelect, 
  onClose 
}) => {
  const [selectedSteps, setSelectedSteps] = useState<JobStep[]>(currentSteps);
  const [stepMachines, setStepMachines] = useState<Record<string, string>>({});
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
console.log("machines", machines)
  useEffect(() => {
    fetchMachines();
    // Initialize step machines from current selection
    const initialStepMachines: Record<string, string> = {};
    currentSteps.forEach(step => {
      const machine = selectedMachines.find(m => 
        STEP_TO_MACHINE_MAPPING[step.stepName]?.some(type => 
          m.machineType.toLowerCase().includes(type.toLowerCase())
        )
      );
      if (machine) {
        initialStepMachines[step.stepName] = machine.id;
      }
    });
    setStepMachines(initialStepMachines);
  }, []);

  const fetchMachines = async () => {
    // Your existing fetch logic
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('https://nrprod.nrcontainers.com/api/machines?', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setMachines(data.data);
      }
    } catch (err) {
      console.error("Machine fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepToggle = (stepName: string) => {
    setSelectedSteps(prev => {
      const exists = prev.some(step => step.stepName === stepName);
      if (exists) {
        // Remove step and its machine selection
        setStepMachines(prevMachines => {
          const newMachines = { ...prevMachines };
          delete newMachines[stepName];
          return newMachines;
        });
        return prev.filter(step => step.stepName !== stepName);
      } else {
        return [...prev, { 
          stepNo: prev.length + 1, 
          stepName, 
          machineDetail: '' 
        }];
      }
    });
  };

  const handleMachineSelect = (stepName: string, machineId: string) => {
    setStepMachines(prev => ({
      ...prev,
      [stepName]: machineId
    }));
  };

const getMachinesForStep = (stepName: string) => {
    const machineTypes = STEP_TO_MACHINE_MAPPING[stepName];
    if (!machineTypes || machineTypes.length === 0) return [];
    
    return machines.filter(machine =>
      machineTypes.some(type => 
        machine.machineType.toLowerCase().includes(type.toLowerCase())
      )
    );
  };

    const hasMachineRequirement = (stepName: string) => {
    const machineTypes = STEP_TO_MACHINE_MAPPING[stepName];
    return machineTypes && machineTypes.length > 0;
  };

  const handleSave = () => {
    // Convert stepMachines back to Machine[] format for existing data structure
   const machinesArray = Object.entries(stepMachines)
    .map(([stepName, machineId]) => machines.find(m => m.id === machineId))
    .filter(Boolean) as Machine[];
  
  console.log('Selected steps:', selectedSteps);
  console.log('Step machines mapping:', stepMachines);
  console.log('Machines array being sent:', machinesArray);
  
  onSelect(selectedSteps, machinesArray);
  };

      const formatStepName = (stepName: string): string => {
    return stepName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle consecutive capitals
      .trim();
  };


return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={onClose}>
          &times;
        </button>
        
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Select Steps & Machines</h2>
          <p className="text-gray-500 text-center mb-6">Select steps and assign machines where required:</p>

          {loading && <div className="text-center py-4">Loading...</div>}
          
          {!loading && (
            <div className="w-full space-y-4">
              {allStepsOptions.map(option => {
                const isSelected = selectedSteps.some(step => step.stepName === option.stepName);
                const availableMachines = getMachinesForStep(option.stepName);
                const selectedMachineId = stepMachines[option.stepName] || '';
                const requiresMachine = hasMachineRequirement(option.stepName);

                return (
                  <div key={option.stepName} className="border border-gray-200 rounded-lg p-3">
                    {/* Step Checkbox */}
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStepToggle(option.stepName)}
                        className="form-checkbox h-5 w-5 text-[#00AEEF] border-gray-300 focus:ring-[#00AEEF] rounded"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-base font-medium text-gray-800">{formatStepName(option.stepName)}</span>
                        <span className="block text-sm text-gray-500">{option.description}</span>
                        {!requiresMachine && (
                          <span className="block text-xs text-green-600 mt-1">No machine assignment required</span>
                        )}
                      </div>
                    </label>

                    {/* Machine Dropdown - Only show if step is selected AND requires machine */}
                    {isSelected && requiresMachine && availableMachines.length > 0 && (
                      <div className="mt-3 pl-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Machine ({STEP_TO_MACHINE_MAPPING[option.stepName]?.join(' / ')})
                        </label>
                        <select
                          value={selectedMachineId}
                          onChange={(e) => handleMachineSelect(option.stepName, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                        >
                          <option value="">Choose a machine...</option>
                          {availableMachines.map(machine => (
                            <option key={machine.id} value={machine.id}>
                              {machine.machineCode} - {machine.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Show message if step requires machine but none available */}
                    {isSelected && requiresMachine && availableMachines.length === 0 && (
                      <div className="mt-3 pl-8 text-sm text-amber-600">
                        No machines available for this step
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition shadow-md mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStepsModal;
