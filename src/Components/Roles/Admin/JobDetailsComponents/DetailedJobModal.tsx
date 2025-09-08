import React from 'react';
import { X, CheckCircle, Clock, Calendar, TrendingUp } from 'lucide-react';

interface Job {
  id: number;
  nrcJobNo: string;
  status?: string;
  finalStatus?: string;
  company?: string;
  customerName?: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
  totalDuration?: number;
  jobDetails?: any;
  purchaseOrderDetails?: any;
  allSteps?: any[];
  steps?: any[];
}

interface DetailedJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const DetailedJobModal: React.FC<DetailedJobModalProps> = ({ 
  isOpen, 
  onClose, 
  job 
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{job.nrcJobNo}</h2>
              <p className="text-blue-100">
                {job.company || job.customerName || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Job Details */}
              {job.jobDetails && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Job Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Style ID:</span>
                      <span className="text-gray-900">{job.jobDetails.styleId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Box Dimensions:</span>
                      <span className="text-gray-900">{job.jobDetails.boxDimensions || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Board Size:</span>
                      <span className="text-gray-900">{job.jobDetails.boardSize || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Process Colors:</span>
                      <span className="text-gray-900">{job.jobDetails.processColors || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">No. of Ups:</span>
                      <span className="text-gray-900">{job.jobDetails.noUps || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Width:</span>
                      <span className="text-gray-900">{job.jobDetails.width || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Height:</span>
                      <span className="text-gray-900">{job.jobDetails.height || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Length:</span>
                      <span className="text-gray-900">{job.jobDetails.length || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Pre-Rate:</span>
                      <span className="text-gray-900">₹{job.jobDetails.preRate || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Order Details */}
              {job.purchaseOrderDetails && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Purchase Order Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">PO Number:</span>
                      <span className="text-gray-900">{job.purchaseOrderDetails.poNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Customer:</span>
                      <span className="text-gray-900">{job.purchaseOrderDetails.customer || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Unit:</span>
                      <span className="text-gray-900">{job.purchaseOrderDetails.unit || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total Quantity:</span>
                      <span className="text-gray-900">{job.purchaseOrderDetails.totalPOQuantity || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">No. of Sheets:</span>
                      <span className="text-gray-900">{job.purchaseOrderDetails.noOfSheets || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">PO Date:</span>
                      <span className="text-gray-900">
                        {job.purchaseOrderDetails.poDate ? new Date(job.purchaseOrderDetails.poDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Delivery Date:</span>
                      <span className="text-gray-900">
                        {job.purchaseOrderDetails.deliveryDate ? new Date(job.purchaseOrderDetails.deliveryDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.purchaseOrderDetails.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.purchaseOrderDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.purchaseOrderDetails.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Timeline & Status */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline & Status
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-900">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {job.completedAt && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Completed:</span>
                      <span className="text-gray-900">
                        {new Date(job.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {job.completedBy && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Completed By:</span>
                      <span className="text-gray-900">{job.completedBy}</span>
                    </div>
                  )}
                  {job.totalDuration && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total Duration:</span>
                      <span className="text-gray-900">{job.totalDuration} days</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Information */}
              {job.allSteps && job.allSteps.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                                                {(job.status || job.finalStatus) === 'completed' ? 'Completed Steps' : 'Job Steps'} ({job.allSteps?.length || job.steps?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(job.allSteps || job.steps || []).map((step: any, stepIndex: number) => (
                      <div key={step.id || stepIndex} className="bg-white p-3 rounded border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 text-sm">{step.stepName}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        
                        {/* Step Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          {step.startDate && (
                            <div className="flex justify-between">
                              <span>Start:</span>
                              <span>{new Date(step.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {step.endDate && (
                            <div className="flex justify-between">
                              <span>End:</span>
                              <span>{new Date(step.endDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Machine Details */}
                        {step.machineDetails && step.machineDetails.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-1">Machine Details:</p>
                            {step.machineDetails.map((machine: any, machineIndex: number) => (
                              <div key={machineIndex} className="text-xs text-gray-500 ml-2 space-y-1">
                                <div className="flex justify-between">
                                  <span>Unit:</span>
                                  <span>{machine.unit || 'No unit'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Machine ID:</span>
                                  <span>{machine.machineId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Machine Code:</span>
                                  <span>{machine.machineCode || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Machine Type:</span>
                                  <span>{machine.machineType}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedJobModal; 