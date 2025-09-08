// src/Components/Roles/Planner/modal/EditMachineModal.tsx
import React, { useState, useEffect } from 'react';
import { type Machine, type JobPlanStep } from '../Types/job';

interface EditMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobNrcNo: string;
  jobSteps: JobPlanStep[];
  onSave: (updatedSteps: JobPlanStep[]) => Promise<void>;
}

interface MachineAssignment {
  stepId: number;
  stepName: string;
  machineType: 'inside Machine' | 'PaperStore' | 'QualityDept' | 'DispatchProcess' | 'Not Editable';
  currentMachine: Machine | null;
  isEditable: boolean;
  isPermanentlyLocked: boolean;
}

const EditMachineModal: React.FC<EditMachineModalProps> = ({ 
  isOpen, 
  onClose, 
  jobNrcNo, 
  jobSteps, 
  onSave 
}) => {
  const [machineAssignments, setMachineAssignments] = useState<MachineAssignment[]>([]);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize machine assignments when modal opens
  useEffect(() => {
    if (isOpen && jobSteps.length > 0) {
      initializeMachineAssignments();
      fetchAvailableMachines();
    }
  }, [isOpen, jobSteps]);

  const initializeMachineAssignments = () => {
    const assignments: MachineAssignment[] = jobSteps.map(step => {
      const isPermanentlyLocked = ['PaperStore', 'QualityDept', 'DispatchProcess'].includes(step.stepName);
      // For JobPlanStep, we need to determine machine type from step name or use a default
      const stepMachineType = getMachineTypeFromStepName(step.stepName);
      const isEditable = !isPermanentlyLocked && stepMachineType === 'inside Machine';
      
      return {
        stepId: step.id,
        stepName: step.stepName,
        machineType: stepMachineType,
        currentMachine: step.machineDetails?.[0] ? {
          machineType: stepMachineType, // Add the missing machineType property
          id: step.machineDetails[0].id,
          unit: step.machineDetails[0].unit || '',
          machineCode: step.machineDetails[0].machineCode || '',
          description: step.machineDetails[0].machineType || step.stepName,
          type: stepMachineType,
          capacity: 0,
          remarks: null,
          status: 'available',
          isActive: true,
          createdAt: '',
          updatedAt: '',
          jobs: []
        } : null,
        isEditable,
        isPermanentlyLocked
      };
    });
    
    setMachineAssignments(assignments);
  };

  // Helper function to determine machine type from step name
  const getMachineTypeFromStepName = (stepName: string): 'inside Machine' | 'PaperStore' | 'QualityDept' | 'DispatchProcess' | 'Not Editable' => {
    switch (stepName) {
      case 'PaperStore':
      case 'QualityDept':
      case 'DispatchProcess':
        return 'Not Editable';
      case 'PrintingDetails':
      case 'Corrugation':
      case 'FluteLaminateBoardConversion':
      case 'Punching':
      case 'SideFlapPasting':
        return 'inside Machine';
      default:
        return 'inside Machine';
    }
  };

  const fetchAvailableMachines = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const response = await fetch('https://nrprod.nrcontainers.com/api/machines', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch machines: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Filter machines that are available and inside "Machine" type
        const filteredMachines = result.data.filter((machine: Machine) => 
          machine.status === 'available' && 
          machine.isActive && 
          machine.machineType === 'inside Machine'
        );
        setAvailableMachines(filteredMachines);
      }
    } catch (err) {
      console.error('Failed to fetch machines:', err);
      setError('Failed to load available machines');
    } finally {
      setLoading(false);
    }
  };

  const handleMachineChange = (stepId: number, machine: Machine | null) => {
    setMachineAssignments(prev => 
      prev.map(assignment => 
        assignment.stepId === stepId 
          ? { ...assignment, currentMachine: machine }
          : assignment
      )
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate that all editable steps have machines assigned (if Regular demand)
      const editableAssignments = machineAssignments.filter(a => a.isEditable);
      const unassignedSteps = editableAssignments.filter(a => !a.currentMachine);
      
      if (unassignedSteps.length > 0) {
        setError(`Please assign machines to all editable steps: ${unassignedSteps.map(s => s.stepName).join(', ')}`);
        return;
      }

      // Update job steps with new machine assignments
      const updatedSteps = jobSteps.map(step => {
        const assignment = machineAssignments.find(a => a.stepId === step.id);
        if (assignment && assignment.isEditable && assignment.currentMachine) {
          return {
            ...step,
            machineDetails: [{
              id: assignment.currentMachine.id,
              unit: assignment.currentMachine.unit,
              machineCode: assignment.currentMachine.machineCode,
              machineType: assignment.currentMachine.machineType
            }]
          };
        }
        return step;
      });

      await onSave(updatedSteps);
      setSuccess('Machine assignments updated successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
      
    } catch (err) {
      setError(`Failed to update machine assignments: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-50 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="w-full px-8 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Machine Assignments</h2>
              <p className="text-gray-600 mt-1">Job: {jobNrcNo}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold hover:cursor-pointer"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-8 py-6 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm mb-4">
              {success}
            </div>
          )}

          {/* Machine Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machineAssignments.map((assignment) => (
              <div 
                key={assignment.stepId}
                className={`p-4 rounded-lg border-2 ${
                  assignment.isPermanentlyLocked
                    ? 'bg-gray-100 border-gray-300'
                    : assignment.currentMachine
                    ? 'bg-green-50 border-green-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{assignment.stepName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.isPermanentlyLocked
                      ? 'bg-gray-200 text-gray-600'
                      : assignment.currentMachine
                      ? 'bg-green-200 text-green-700'
                      : 'bg-yellow-200 text-yellow-700'
                  }`}>
                    {assignment.isPermanentlyLocked ? 'Permanently Locked' : assignment.currentMachine ? 'Assigned' : 'Not Assigned'}
                  </span>
                </div>

                {assignment.isPermanentlyLocked ? (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">This step is permanently locked and cannot be assigned a machine.</p>
                    <p className="text-xs text-gray-500">PaperStore, QC, and Dispatch steps are always "Not Assigned"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Machine Type: {assignment.machineType}
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned Machine
                      </label>
                      <select
                        value={assignment.currentMachine?.id || ''}
                        onChange={(e) => {
                          const machine = e.target.value 
                            ? availableMachines.find(m => m.id === e.target.value) || null
                            : null;
                          handleMachineChange(assignment.stepId, machine);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                        disabled={loading}
                      >
                        <option value="">Select Machine</option>
                        {availableMachines.map(machine => (
                          <option key={machine.id} value={machine.id}>
                            {machine.machineCode} - {machine.description} ({machine.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {assignment.currentMachine && (
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <p><strong>Machine:</strong> {assignment.currentMachine.machineCode}</p>
                        <p><strong>Description:</strong> {assignment.currentMachine.description}</p>
                        <p><strong>Unit:</strong> {assignment.currentMachine.unit}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full px-8 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0099cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMachineModal; 