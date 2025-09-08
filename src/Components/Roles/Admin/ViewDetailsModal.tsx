import React from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

interface StepData {
  id: number;
  jobNrcJobNo: string;
  status: string;
  [key: string]: any; // Allow for different field structures
}

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepName: string;
  stepData: StepData | null;
  onEditDetails: () => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  stepName,
  stepData,
  onEditDetails
}) => {
  if (!isOpen || !stepData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  const formatFieldValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Not set';
    }
    
    if (key.toLowerCase().includes('date')) {
      return formatDate(value);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return value.toString();
  };

  const renderField = (key: string, value: any) => {
    // Skip internal fields that shouldn't be displayed
    if (['id', 'jobStepId'].includes(key)) return null;
    
    return (
      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
        <span className="font-medium text-gray-700">{formatFieldName(key)}:</span>
        <span className="text-gray-900">{formatFieldValue(key, value)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-md bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-[#00AEEF] px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">{stepName} Details</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {/* Step Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{stepData.jobNrcJobNo}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Step ID:</span> {stepData.id}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    stepData.status === 'accept' ? 'bg-green-100 text-green-800' : 
                    stepData.status === 'reject' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {stepData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Details */}
            <div className="space-y-2">
              <h5 className="text-lg font-semibold text-gray-900 mb-3">Step Information</h5>
              {Object.entries(stepData).map(([key, value]) => renderField(key, value))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEditDetails}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal; 