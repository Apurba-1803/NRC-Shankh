import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface StepData {
  id: number;
  jobNrcJobNo: string;
  status: string;
  [key: string]: any;
}

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepName: string;
  stepData: StepData | null;
  onUpdate: (updatedData: StepData) => void;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({
  isOpen,
  onClose,
  stepName,
  stepData,
  onUpdate
}) => {
  const [formData, setFormData] = useState<StepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stepData) {
      setFormData({ ...stepData });
    }
  }, [stepData]);

  if (!isOpen || !stepData || !formData) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getFieldType = (field: string) => {
    if (field.toLowerCase().includes('date')) return 'datetime-local';
    if (field === 'quantity' || field === 'available' || field === 'wastage' || field === 'rejectedQty' || field === 'balanceQty') return 'number';
    if (field === 'noOfColours') return 'number';
    if (field === 'gsm1' || field === 'gsm2') return 'number';
    if (field === 'extraSheets') return 'number';
    if (field === 'extraMargin') return 'text';
    if (field === 'status') return 'select';
    return 'text';
  };

  const getFieldOptions = (field: string) => {
    if (field === 'status') {
      return [
        { value: 'accept', label: 'Accept' },
        { value: 'reject', label: 'Reject' },
        { value: 'pending', label: 'Pending' }
      ];
    }
    return [];
  };

  const renderField = (key: string, value: any) => {
    // Skip internal fields that shouldn't be edited
    if (['id', 'jobStepId', 'jobNrcJobNo'].includes(key)) return null;
    
    const fieldType = getFieldType(key);
    const options = getFieldOptions(key);
    
    if (fieldType === 'select') {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
          </label>
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (fieldType === 'datetime-local') {
      const dateValue = value ? new Date(value).toISOString().slice(0, 16) : '';
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
          </label>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    if (fieldType === 'number') {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value === '' ? null : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError(null);

    try {
      await onUpdate(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent backdrop-blur-md bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-[#00AEEF] px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Edit {stepName} Details</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {/* Job Information (Read-only) */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{formData.jobNrcJobNo}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Step ID:</span> {formData.id}
                </div>
                <div>
                  <span className="font-medium">Step Name:</span> {stepName}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Editable Fields */}
            <div className="space-y-2">
              <h5 className="text-lg font-semibold text-gray-900 mb-3">Edit Information</h5>
              {Object.entries(formData).map(([key, value]) => renderField(key, value))}
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Update</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDetailsModal; 