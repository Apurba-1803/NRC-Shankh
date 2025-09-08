import React, { useState, useEffect } from 'react';
import { XMarkIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface Machine {
  id: string;
  unit: string;
  machineCode: string;
  machineType: string;
  description: string;
  type: string;
  capacity: number;
  remarks: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobs: any[];
}

interface MachineDetail {
  machineId: string;
  machineType: string;
  machineCode: string;
  unit: string;
}

interface JobStep {
  id: number;
  stepNo: number;
  stepName: string;
  machineDetails: MachineDetail[];
  status: 'planned' | 'start' | 'stop' | 'completed';
  startDate: string | null;
  endDate: string | null;
  user: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: 'high' | 'medium' | 'low' | null;
  createdAt: string;
  updatedAt: string;
  steps: JobStep[];
}

interface EditMachineModalProps {
  step: JobStep;
  job: JobPlan;
  onClose: () => void;
  onUpdate: () => void;
}

const EditMachineModal: React.FC<EditMachineModalProps> = ({
  step,
  job,
  onClose,
  onUpdate
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [machinesLoading, setMachinesLoading] = useState(true);

  // Machine type mapping based on step name
  const getMachineTypeForStep = (stepName: string): string => {
    const mapping: { [key: string]: string } = {
      'PaperStore': 'Paper Store',
      'PrintingDetails': 'Printing',
      'Corrugation': 'Corrugation',
      'FluteLaminateBoardConversion': 'Flute Laminator',
      'Punching': 'Manual Punching', // or 'Auto Punching'
      'SideFlapPasting': 'Manual Flap Pasting', // or 'Auto Flap Pasting'
      'QualityDept': 'Quality Department',
      'DispatchProcess': 'Dispatch Process'
    };
    return mapping[stepName] || stepName;
  };

  // Fetch machines on component mount
  useEffect(() => {
    fetchMachines();
  }, []);

  // Filter machines when machines or step changes
  useEffect(() => {
    if (machines.length > 0) {
      const stepMachineType = getMachineTypeForStep(step.stepName);
      const filtered = machines.filter(machine => 
        machine.machineType === stepMachineType ||
        (step.stepName === 'Punching' && (machine.machineType === 'Manual Punching' || machine.machineType === 'Auto Punching')) ||
        (step.stepName === 'SideFlapPasting' && (machine.machineType === 'Manual Flap Pasting' || machine.machineType === 'Auto Flap Pasting'))
      );
      setFilteredMachines(filtered);
    }
  }, [machines, step.stepName]);

  const fetchMachines = async () => {
    try {
      setMachinesLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      console.log('EditMachineModal: Access token:', accessToken ? 'Present' : 'Missing');
      
      const response = await fetch('https://nrprod.nrcontainers.com/api/machines', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMachines(data.data);
        }
      } else {
        console.error('Failed to fetch machines:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
    } finally {
      setMachinesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) {
      alert('Please select a machine');
      return;
    }

    setLoading(true);

    try {
      const selectedMachineData = machines.find(m => m.id === selectedMachine);
      
      // Prepare the updated step data
      const updatedStep: JobStep = {
        ...step,
        machineDetails: [{
          machineId: selectedMachineData?.id || '',
          machineType: selectedMachineData?.machineType || '',
          machineCode: selectedMachineData?.machineCode || '',
          unit: selectedMachineData?.unit || ''
        }]
      };

      // Update the step in the job
      const updatedSteps = job.steps.map(s => 
        s.stepNo === step.stepNo ? updatedStep : s
      );

      const updatePayload = {
        nrcJobNo: job.nrcJobNo,
        jobDemand: job.jobDemand,
        steps: updatedSteps
      };

      // Make the API call
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `https://nrprod.nrcontainers.com/api/job-planning/${encodeURIComponent(job.nrcJobNo)}/steps/${step.stepNo}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        }
      );

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        throw new Error('Failed to update machine assignment');
      }
    } catch (error) {
      console.error('Error updating machine assignment:', error);
      alert('Failed to update machine assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-md bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="bg-[#00AEEF] px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Edit Machine Assignment</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Edit Machine Assignment</h4>
            <p className="text-gray-600 mb-6">Update machine assignment for this step</p>
            
            <h5 className="text-lg font-semibold text-gray-900 mb-4">Assign Machines to Work Steps</h5>

            {/* Step Info */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-center space-x-3">
                <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
                <span className="text-yellow-800 font-semibold">{step.stepName}</span>
              </div>
            </div>

            {/* Machines List */}
            <div className="max-h-96 overflow-y-auto">
              {machinesLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading machines...</div>
                </div>
              ) : filteredMachines.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-500">No machines available for this step type</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMachines.map((machine) => (
                    <label key={machine.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="machine"
                        value={machine.id}
                        checked={selectedMachine === machine.id}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{machine.unit} - {machine.machineCode}</div>
                        <div className="text-sm text-gray-600">{machine.machineType}</div>
                        <div className="text-sm text-gray-600">Capacity: {machine.capacity}/8hrs</div>
                        <div className="text-sm text-gray-600">Status: {machine.status}</div>
                        <div className="text-sm text-gray-600">Active: {machine.isActive ? 'Yes' : 'No'}</div>
                        <div className="text-sm text-gray-600">Created: {formatDate(machine.createdAt)}</div>
                        <div className="text-sm text-gray-600">Updated: {formatDate(machine.updatedAt)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="-50 px-6 py-3 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedMachine}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Assignment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMachineModal; 