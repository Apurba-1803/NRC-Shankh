// Add this new component for bulk job planning
import React, { useState } from 'react';
import AddStepsModal from './AddStepsModal';
import SelectDemandModal from './SelectDemandModal';
import {type JobStep,type Machine } from '../Types/job.ts';

interface PurchaseOrder {
  id: number;
  boardSize: string | null;
  customer: string;
  deliveryDate: string;
  dieCode: number | null;
  dispatchDate: string | null;
  dispatchQuantity: number | null;
  fluteType: string | null;
  jockeyMonth: string | null;
  noOfUps: number | null;
  nrcDeliveryDate: string | null;
  noOfSheets: number | null;
  poDate: string;
  poNumber: string;
  pendingQuantity: number | null;
  pendingValidity: number | null;
  plant: string | null;
  shadeCardApprovalDate: string | null;
  sharedCardDiffDate: number | null;
  srNo: number | null;
  style: string | null;
  totalPOQuantity: number | null;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobNrcJobNo: string | null;
  userId: string | null;
  job: {
    nrcJobNo: string;
    customerName: string;
    styleItemSKU: string;
  } | null;
  user: any | null;
  boxDimensions: string | null;
  processColors?: string;
  jobBoardSize: string | null;
}

interface BulkJobPlanningModalProps {
  filteredPOs: PurchaseOrder[];
  onSave: (jobPlanningData: any) => Promise<void>;
  onClose: () => void;
}

const STEP_TO_MACHINE_MAPPING: Record<string, string[]> = {
  'SideFlapPasting': ['auto flap', 'manual fi'],
  'Punching': ['auto pund', 'manual pu'],
  'FluteLaminateBoardConversion': ['flute lam'],
  'Corrugation': ['corrugatic'],
  'PrintingDetails': ['printing'],
  'PaperStore': [],
  'QualityDept': [],
  'DispatchProcess': [],
};

export const BulkJobPlanningModal: React.FC<BulkJobPlanningModalProps> = ({ 
  filteredPOs, 
  onSave, 
  onClose 
}) => {
  const [jobDemand, setJobDemand] = useState<'high' | 'medium' | "low" | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<JobStep[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<Machine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);

  const getDemandDisplayLabel = (demand: 'high' | 'medium'| "low" | null) => {
    switch (demand) {
      case 'high': return 'Urgent';
      case 'medium': return 'Regular';
      default: return 'Choose Demand Level';
    }
  };

  const getDemandStyling = (demand: 'high' | 'medium'| "low" | null) => {
    switch (demand) {
      case 'high': return 'border-red-400 bg-red-50 text-red-700';
      case 'medium': return 'border-[#00AEEF] bg-[#00AEEF]/10 text-[#00AEEF]';
      default: return 'border-gray-300 bg-white text-gray-500';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!jobDemand) {
      setError('Please select a demand level.');
      setIsSubmitting(false);
      return;
    }

    if (!selectedSteps || selectedSteps.length === 0) {
      setError('Please select at least one production step.');
      setIsSubmitting(false);
      return;
    }

    if (jobDemand === 'medium' && (!selectedMachines || selectedMachines.length === 0)) {
      setError('Regular demand requires machine assignment for all selected steps.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 🎯 UPDATED: Create individual job plans with PO IDs
      const bulkJobPlanningData = {
        // 🎯 CREATE INDIVIDUAL JOB PLANS FOR EACH PO
        jobPlans: filteredPOs.map(po => ({
          nrcJobNo: po.jobNrcJobNo || po.job?.nrcJobNo,
          poId: po.id, // 🎯 INCLUDE PO ID FOR EACH JOB PLAN
          jobDemand: jobDemand,
          steps: selectedSteps.map((step, stepIndex) => {
            const machineTypesForStep = STEP_TO_MACHINE_MAPPING[step.stepName];
            let assignedMachine = null;
            
            if (machineTypesForStep && machineTypesForStep.length > 0) {
              assignedMachine = selectedMachines.find(m => 
                machineTypesForStep.some(type => 
                  m.machineType.toLowerCase().includes(type.toLowerCase())
                )
              );
            }

            return {
              jobStepId: stepIndex + 1,
              stepNo: step.stepNo || stepIndex + 1,
              stepName: step.stepName,
              machineDetails: assignedMachine ? [{
                id: assignedMachine.id,
                unit: po.unit || 'Unit 1',
                machineCode: assignedMachine.machineCode,
                machineType: assignedMachine.machineType || 'Production Step'
              }] : [],
              status: 'planned' as const,
              startDate: null,
              endDate: null,
              user: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          })
        })),
        
        // 🎯 LEGACY SUPPORT: Keep original structure for backward compatibility
        poIds: filteredPOs.map(po => po.id),
        nrcJobNos: filteredPOs.map(po => po.jobNrcJobNo).filter(Boolean),
        jobDemand: jobDemand,
        steps: selectedSteps.map(step => {
          const machineTypesForStep = STEP_TO_MACHINE_MAPPING[step.stepName];
          let assignedMachine = null;
          
          if (machineTypesForStep && machineTypesForStep.length > 0) {
            assignedMachine = selectedMachines.find(m => 
              machineTypesForStep.some(type => 
                m.machineType.toLowerCase().includes(type.toLowerCase())
              )
            );
          }

          return {
            stepNo: step.stepNo,
            stepName: step.stepName,
            machineDetail: assignedMachine ? assignedMachine.machineType || assignedMachine.machineCode : 'Not Assigned',
            machineId: assignedMachine ? assignedMachine.id : null,
            machineCode: assignedMachine ? assignedMachine.machineCode : null,
          };
        }),
        selectedMachines: selectedMachines
      };

      // 🎯 DEBUG LOG
      console.log('📤 Bulk job planning data with PO IDs:', bulkJobPlanningData);
      console.log('📋 Individual job plans:', bulkJobPlanningData.jobPlans);

      await onSave(bulkJobPlanningData);
    } catch (err) {
      setError(`Failed to save bulk job planning: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Bulk Job Planning</h2>
          <p className="text-gray-500 text-center mb-2">Apply job planning to {filteredPOs.length} selected POs</p>
          
          {/* Show PO count */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 w-full">
            <p className="text-sm text-blue-800 text-center">
              This will create job plans for <strong>{filteredPOs.length} Purchase Orders</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">
                {error}
              </div>
            )}

            {/* Select Demand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Demand</label>
              <div
                className={`w-full px-3 py-2 border-2 rounded-md flex justify-between items-center transition-all duration-200 cursor-pointer hover:scale-105 ${getDemandStyling(jobDemand)}`}
                onClick={() => setShowDemandModal(true)}
              >
                <span className="font-medium">{getDemandDisplayLabel(jobDemand)}</span>
                <span>&#9660;</span>
              </div>
              
              {jobDemand === 'medium' && (
                <div className="mt-2 p-2 bg-[#00AEEF]/20 border border-[#00AEEF]/30 rounded text-xs text-[#00AEEF]">
                  <strong>Regular:</strong> Machine assignment is mandatory for all selected steps
                </div>
              )}
            </div>

            {/* Add Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Steps {jobDemand === 'medium' && <span className="text-red-500">*</span>}
              </label>
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center cursor-pointer"
                onClick={() => setShowStepsModal(true)}
              >
                <span>{selectedSteps.length > 0 ? `${selectedSteps.length} step(s) selected` : 'Choose the steps of the job'}</span>
                <span>&#9660;</span>
              </div>
              
              {jobDemand === 'medium' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>Required:</strong> All selected steps must have machine assignments for Regular demand
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSteps.map(step => (
                  <span key={step.stepName} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {step.stepName}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
              {isSubmitting ? 'Creating Job Plans...' : `Create Job Plans for ${filteredPOs.length} POs`}
            </button>
          </form>
        </div>

        {/* Sub-modals */}
        {showDemandModal && (
          <SelectDemandModal
            currentDemand={jobDemand}
            onSelect={(demand) => { setJobDemand(demand); setShowDemandModal(false); }}
            onClose={() => setShowDemandModal(false)}
          />
        )}
        {showStepsModal && (
          <AddStepsModal
            currentSteps={selectedSteps}
            selectedMachines={selectedMachines}
            onSelect={(steps, machines) => { 
              setSelectedSteps(steps); 
              setSelectedMachines(machines);
              setShowStepsModal(false); 
            }}
            onClose={() => setShowStepsModal(false)}
          />
        )}
      </div>
    </div>
  );
};
