import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { type Job } from '../Types/job';

// interface Job {
//   id: number;
//   customerName: string;
//   styleItemSKU: string;
//   nrcJobNo: string;
//   fluteType: string | null;
//   status: string;
//   latestRate: number | null;
//   preRate: number | null;
//   length: number | null;
//   width: number | null;
//   height: number | null;
//   boxDimensions: string | null;
//   diePunchCode: string | null;
//   boardCategory: string | null;
//   noOfColor: number | null;
//   processColors: string | null;
//   specialColor1: string | null;
//   specialColor2: string | null;
//   specialColor3: string | null;
//   specialColor4: string | null;
//   overPrintFinishing: string | null;
//   topFaceGSM: number | null;
//   flutingGSM: number | null;
//   bottomLinerGSM: number | null;
//   decalBoardX: number | null;
//   lengthBoardY: number | null;
//   boardSize: string | null;
//   noUps: number | null;
//   artworkReceivedDate: string | null;
//   artworkApprovedDate: string | null;
//   shadeCardApprovalDate: string | null;
//   srNo: string | null;
//   jobDemand: string | null;
//   createdAt: string;
//   updatedAt: string;
//   imageURL?: string;
// }

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onContinueJob: (nrcJobNo: string) => Promise<void>;
  onRefresh?: () => void; // Add refresh callback
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ 
  job, 
  onClose, 
  onContinueJob, 
  onRefresh 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedJob, setEditedJob] = useState<Job>({ ...job });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<Job>({ ...job });


  // Helper to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper to format date for input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof Job, value: string | number | null) => {
    setEditedJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // In JobDetailModal component, add this useEffect
// useEffect(() => {
//   setCurrentJob({ ...job });
//   setEditedJob({ ...job });
// }, [job.id, job.updatedAt]); // React to job changes


  // Save changes
const handleSave = async () => {
  setIsSaving(true);
  setSaveMessage(null);
  
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Authentication token not found. Please log in.');
    }

    // Prepare the update payload - only include changed fields
    const updatePayload: Record<string, any> = {};
    
    // Compare each field and only include changed ones
    Object.keys(editedJob).forEach(key => {
      const jobKey = key as keyof Job;
      if (editedJob[jobKey] !== job[jobKey]) {
        updatePayload[jobKey] = editedJob[jobKey];
      }
    });

    // If no changes, just exit edit mode
    if (Object.keys(updatePayload).length === 0) {
      setIsEditing(false);
      setSaveMessage('No changes to save');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // URL encode the job number for the API endpoint
    const encodedJobNo = encodeURIComponent(job.nrcJobNo);
    
    const response = await fetch(`https://nrprod.nrcontainers.com/api/jobs/${encodedJobNo}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update job: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      setSaveMessage('Job details updated successfully!');
      setIsEditing(false);
      
      // Update the current job display immediately
      setCurrentJob({ ...editedJob });
      
      // Refresh parent data
      if (onRefresh) {
        await onRefresh();
      }
      
      // Close modal after showing success message briefly
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } else {
      throw new Error(result.message || 'Failed to update job details.');
    }
  } catch (error) {
    console.error('Save job error:', error);
    setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsSaving(false);
  }
};




  // Cancel editing
  const handleCancelEdit = () => {
    setEditedJob({ ...job }); // Reset to original values
    setIsEditing(false);
    setSaveMessage(null);
  };

  // Continue job handler
  const handleContinueClick = async () => {
    setIsUpdating(true);
    try {
      await onContinueJob(job.nrcJobNo);
      onClose();
    } catch (error) {
      console.error("Failed to continue job from modal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Render field - editable or read-only
 const renderField = (
  label: string, 
  field: keyof Job, 
  type: 'text' | 'number' | 'date' = 'text'
) => {
  const value = isEditing ? editedJob[field] : currentJob[field];
  
  // Handle complex types that can't be edited directly in inputs
  const isComplexType = Array.isArray(value) || (typeof value === 'object' && value !== null);
  
  return (
    <div className="flex flex-col mb-3">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      {isEditing && !isComplexType ? (
        <input
          type={type}
          value={
            type === 'date' 
              ? formatDateForInput(value as string) 
              : value || ''
          }
          onChange={(e) => {
            let newValue: string | number | null = e.target.value;
            
            if (type === 'number') {
              newValue = newValue === '' ? null : Number(newValue);
            } else if (type === 'date') {
              newValue = newValue === '' ? null : new Date(newValue).toISOString();
            } else {
              newValue = newValue === '' ? null : newValue;
            }
            
            handleInputChange(field, newValue);
          }}
          className="text-gray-800 bg-white p-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      ) : (
        <div className="text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-200">
          {/* Handle display for different field types */}
          {isComplexType ? (
            <div>
              {Array.isArray(value) ? (
                <div>
                  {field === 'jobSteps' ? (
                    // Special handling for jobSteps array
                    <div className="space-y-2">
                      {(value as any[]).length > 0 ? (
                        (value as any[]).map((step: any, index: number) => (
                          <div key={index} className="text-sm bg-white p-2 border rounded">
                            <span className="font-medium">{step.stepNo}. {step.stepName}</span>
                            {step.machineDetails && step.machineDetails.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                Machine: {step.machineDetails[0].machineCode || 'Not Assigned'}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">No steps defined</span>
                      )}
                    </div>
                  ) : (
                    // Generic array display
                    <span className="text-gray-600">
                      Array with {value.length} item{value.length !== 1 ? 's' : ''}
                      {isEditing && ' (Cannot edit complex data)'}
                    </span>
                  )}
                </div>
              ) : (
                // Handle other object types
                <span className="text-gray-600">
                  Complex data {isEditing && '(Cannot edit)'}
                </span>
              )}
            </div>
          ) : (
            // Handle simple types
            type === 'date' && value 
              ? formatDate(value as string) 
              : (value !== null && value !== '' ? value : 'N/A')
          )}
        </div>
      )}
    </div>
  );
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-2xl mx-2 sm:mx-auto bg-white rounded-2xl shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="w-full max-w-2xl px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          {/* Modal Header */}
          <div className="flex justify-between items-center w-full mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Details: {currentJob.nrcJobNo}</h2>

              <p className="text-gray-500">
                {isEditing ? 'Edit job order details' : 'Detailed information for this job order.'}
              </p>
            </div>
            
            {/* Edit/Save/Cancel buttons */}
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
                  >
                    {isSaving && (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    )}
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`w-full mb-4 px-4 py-3 rounded-lg text-sm ${
              saveMessage.includes('Error') || saveMessage.includes('Failed')
                ? 'bg-red-100 border border-red-400 text-red-700'
                : saveMessage.includes('No changes')
                ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
            {renderField('Customer Name', 'customerName')}
            {renderField('Style Item SKU', 'styleItemSKU')}
            {renderField('NRC Job No', 'nrcJobNo')}
            {renderField('Flute Type', 'fluteType')}
            {renderField('Status', 'status')}
            {renderField('Latest Rate', 'latestRate', 'number')}
            {renderField('Pre Rate', 'preRate', 'number')}
            {renderField('Length', 'length', 'number')}
            {renderField('Width', 'width', 'number')}
            {renderField('Height', 'height', 'number')}
            {renderField('Box Dimensions', 'boxDimensions')}
            {renderField('Die Punch Code', 'diePunchCode', 'number')}
            {renderField('Board Category', 'boardCategory')}
            {renderField('Number of Colors', 'noOfColor', 'number')}
            {renderField('Process Colors', 'processColors')}
            {renderField('Special Color 1', 'specialColor1')}
            {renderField('Special Color 2', 'specialColor2')}
            {renderField('Special Color 3', 'specialColor3')}
            {renderField('Special Color 4', 'specialColor4')}
            {renderField('Over Print Finishing', 'overPrintFinishing')}
            {renderField('Top Face GSM', 'topFaceGSM', 'number')}
            {renderField('Fluting GSM', 'flutingGSM', 'number')}
            {renderField('Bottom Liner GSM', 'bottomLinerGSM', 'number')}
            {renderField('Decal Board X', 'decalBoardX', 'number')}
            {renderField('Length Board Y', 'lengthBoardY', 'number')}
            {renderField('Board Size', 'boardSize')}
            {renderField('No Ups', 'noUps', 'number')}
            {renderField('Artwork Received Date', 'artworkReceivedDate', 'date')}
            {renderField('Artwork Approved Date', 'artworkApprovedDate', 'date')}
            {renderField('Shade Card Approval Date', 'shadeCardApprovalDate', 'date')}
            {renderField('SR No', 'srNo')}
            {renderField('Job Demand', 'jobDemand')}
          </div>

          {/* Artwork Image */}
          {job.imageURL && (
            <div className="mt-6 w-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Artwork Image</h3>
              <img
                src={job.imageURL}
                alt="Artwork"
                className="w-full h-auto max-h-64 object-contain rounded-md border border-gray-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/150x150/cccccc/000000?text=No+Image`;
                }}
              />
            </div>
          )}

          {/* Action Button - Only show if not editing */}
          {!isEditing && (
            <div className="w-full mt-8">
              {job.status === 'ACTIVE' ? (
                <button
                  className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md"
                  disabled
                >
                  This Job is Active
                </button>
              ) : (
                <button
                  className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md"
                  onClick={handleContinueClick}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating Status...' : 'Continue with this job'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
