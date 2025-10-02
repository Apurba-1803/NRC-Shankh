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
  allStepDetails?: {
    paperStore?: any[];
    printingDetails?: any[];
    corrugation?: any[];
    flutelam?: any[];
    punching?: any[];
    sideFlapPasting?: any[];
    qualityDept?: any[];
    dispatchProcess?: any[];
  };
  
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


  console.log('Rendering DetailedJobModal with job:', job);

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
      {(() => {
        // Define step order for sorting
        const stepOrder = [
          'PaperStore',
          'PrintingDetails', 
          'Corrugation',
          'FluteLaminateBoardConversion',
          'Punching',
          'SideFlapPasting',
          'QualityDept',
          'DispatchProcess'
        ];

        // Sort steps according to predefined order
        const sortedSteps = [...(job.allSteps || job.steps || [])].sort((a, b) => {
          const aIndex = stepOrder.indexOf(a.stepName);
          const bIndex = stepOrder.indexOf(b.stepName);
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });

        return sortedSteps.map((step: any, stepIndex: number) => {
          // FIXED: Get step details from allStepDetails based on step name
          const getStepDetails = (stepName: string) => {
            if (!job.allStepDetails) return [];
            
            // Use proper type-safe access
            switch (stepName) {
              case 'PaperStore':
                return job.allStepDetails.paperStore || [];
              case 'PrintingDetails':
                return job.allStepDetails.printingDetails || [];
              case 'Corrugation':
                return job.allStepDetails.corrugation || [];
              case 'FluteLaminateBoardConversion':
                return job.allStepDetails.flutelam || [];
              case 'Punching':
                return job.allStepDetails.punching || [];
              case 'SideFlapPasting':
                return job.allStepDetails.sideFlapPasting || [];
              case 'QualityDept':
                return job.allStepDetails.qualityDept || [];
              case 'DispatchProcess':
                return job.allStepDetails.dispatchProcess || [];
              default:
                return [];
            }
          };

          const stepDetails = getStepDetails(step.stepName);

          return (
            <div key={step.id || stepIndex} className="bg-white p-3 rounded border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 text-sm">
                  {step.stepName.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  step.status === 'completed' ? 'bg-green-100 text-green-800' :
                  step.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {step.status}
                </span>
              </div>
              
              {/* Step Timeline */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
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

              {/* Step Details Section */}
              {stepDetails && stepDetails.length > 0 && (
  <div className="mt-2 pt-2 border-t border-gray-100">
    <p className="text-xs font-medium text-gray-700 mb-2">Step Details:</p>
    {stepDetails.map((detail: any, detailIndex: number) => (
      <div key={detail.id || detailIndex} className="bg-gray-50 p-2 rounded text-xs mb-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Common fields for all steps */}
          {detail.quantity && (
            <div className="flex justify-between">
              <span className="font-medium">Quantity:</span>
              <span>{detail.quantity}</span>
            </div>
          )}
          {/* {detail.machine && (
            <div className="flex justify-between">
              <span className="font-medium">Machine No:</span>
              <span>{detail.machine}</span>
            </div>
          )} */}
          {(detail.oprName || detail.operatorName) && (
            <div className="flex justify-between">
              <span className="font-medium">Operator:</span>
              <span>{(detail.oprName) || (detail.operatorName)}</span>
            </div>
          )}
          {detail.status && (
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`px-1 py-0.5 rounded text-xs ${
                detail.status === 'accept' ? 'bg-green-100 text-green-800' :
                detail.status === 'reject' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {detail.status}
              </span>
            </div>
          )}

          {/* Paper Store specific fields */}
          {step.stepName === 'PaperStore' && (
            <>
              {detail.available && (
                <div className="flex justify-between">
                  <span className="font-medium">Available:</span>
                  <span>{detail.available}</span>
                </div>
              )}
              {detail.sheetSize && (
                <div className="flex justify-between">
                  <span className="font-medium">Sheet Size:</span>
                  <span>{detail.sheetSize}</span>
                </div>
              )}
              {detail.mill && (
                <div className="flex justify-between">
                  <span className="font-medium">Mill:</span>
                  <span>{detail.mill}</span>
                </div>
              )}
              {detail.quality && (
                <div className="flex justify-between">
                  <span className="font-medium">Quality:</span>
                  <span>{detail.quality}</span>
                </div>
              )}
            </>
          )}

          {/* Printing Details specific fields */}
          {step.stepName === 'PrintingDetails' && (
            <>
              {detail.coatingType && (
                <div className="flex justify-between">
                  <span className="font-medium">Coating Type:</span>
                  <span>{detail.coatingType}</span>
                </div>
              )}
              {detail.extraSheets && (
                <div className="flex justify-between">
                  <span className="font-medium">Extra Sheets:</span>
                  <span>{detail.extraSheets}</span>
                </div>
              )}
              {detail.inksUsed && (
                <div className="flex justify-between">
                  <span className="font-medium">Inks Used:</span>
                  <span>{detail.inksUsed}</span>
                </div>
              )}
              {detail.noOfColours && (
                <div className="flex justify-between">
                  <span className="font-medium">No of Colours:</span>
                  <span>{detail.noOfColours}</span>
                </div>
              )}
              {detail.separateSheets && (
                <div className="flex justify-between">
                  <span className="font-medium">Separate Sheets:</span>
                  <span>{detail.separateSheets}</span>
                </div>
              )}
              {detail.wastage && (
                <div className="flex justify-between">
                  <span className="font-medium">Wastage:</span>
                  <span>{detail.wastage}</span>
                </div>
              )}
            </>
          )}

          {/* Corrugation specific fields */}
          {step.stepName === 'Corrugation' && (
            <>
              {detail.flute && (
                <div className="flex justify-between">
                  <span className="font-medium">Flute:</span>
                  <span>{detail.flute}</span>
                </div>
              )}
              {detail.gsm1 && (
                <div className="flex justify-between">
                  <span className="font-medium">GSM 1:</span>
                  <span>{detail.gsm1}</span>
                </div>
              )}
              {detail.gsm2 && (
                <div className="flex justify-between">
                  <span className="font-medium">GSM 2:</span>
                  <span>{detail.gsm2}</span>
                </div>
              )}
              {detail.size && (
                <div className="flex justify-between">
                  <span className="font-medium">Size:</span>
                  <span>{detail.size}</span>
                </div>
              )}
              {/* {detail.pressure && (
                <div className="flex justify-between">
                  <span className="font-medium">Pressure:</span>
                  <span>{detail.pressure}</span>
                </div>
              )}
              {detail.speed && (
                <div className="flex justify-between">
                  <span className="font-medium">Speed:</span>
                  <span>{detail.speed}</span>
                </div>
              )} */}
            </>
          )}

          {/* Flute Laminate Board Conversion specific fields */}
          {step.stepName === 'FluteLaminateBoardConversion' && (
            <>
              {detail.adhesive && (
                <div className="flex justify-between">
                  <span className="font-medium">Adhesive:</span>
                  <span>{detail.adhesive}</span>
                </div>
              )}
              {detail.adhesiveType && (
                <div className="flex justify-between">
                  <span className="font-medium">Adhesive Type:</span>
                  <span>{detail.adhesiveType}</span>
                </div>
              )}
              {detail.film && (
                <div className="flex justify-between">
                  <span className="font-medium">Film:</span>
                  <span>{detail.film}</span>
                </div>
              )}
              {detail.wastage && (
                <div className="flex justify-between">
                  <span className="font-medium">Wastage:</span>
                  <span>{detail.wastage}</span>
                </div>
              )}
              {detail.speed && (
                <div className="flex justify-between">
                  <span className="font-medium">Speed:</span>
                  <span>{detail.speed}</span>
                </div>
              )}
              {detail.bondStrength && (
                <div className="flex justify-between">
                  <span className="font-medium">Bond Strength:</span>
                  <span>{detail.bondStrength}</span>
                </div>
              )}
            </>
          )}

          {/* Punching specific fields */}
          {step.stepName === 'Punching' && (
            <>
              {detail.die && (
                <div className="flex justify-between">
                  <span className="font-medium">Die:</span>
                  <span>{detail.die}</span>
                </div>
              )}
              {detail.dieNumber && (
                <div className="flex justify-between">
                  <span className="font-medium">Die Number:</span>
                  <span>{detail.dieNumber}</span>
                </div>
              )}
              {detail.wastage && (
                <div className="flex justify-between">
                  <span className="font-medium">Wastage:</span>
                  <span>{detail.wastage}</span>
                </div>
              )}
              {detail.strokesPerMinute && (
                <div className="flex justify-between">
                  <span className="font-medium">Strokes/Min:</span>
                  <span>{detail.strokesPerMinute}</span>
                </div>
              )}
              {detail.wastePercentage && (
                <div className="flex justify-between">
                  <span className="font-medium">Waste %:</span>
                  <span>{detail.wastePercentage}</span>
                </div>
              )}
            </>
          )}

          {/* Side Flap Pasting specific fields */}
          {step.stepName === 'SideFlapPasting' && (
            <>
              {detail.adhesive && (
                <div className="flex justify-between">
                  <span className="font-medium">Adhesive:</span>
                  <span>{detail.adhesive}</span>
                </div>
              )}
              {detail.wastage && (
                <div className="flex justify-between">
                  <span className="font-medium">Wastage:</span>
                  <span>{detail.wastage}</span>
                </div>
              )}
              {detail.pastingType && (
                <div className="flex justify-between">
                  <span className="font-medium">Pasting Type:</span>
                  <span>{detail.pastingType}</span>
                </div>
              )}
              {detail.temperature && (
                <div className="flex justify-between">
                  <span className="font-medium">Temperature:</span>
                  <span>{detail.temperature}</span>
                </div>
              )}
              {detail.dryingTime && (
                <div className="flex justify-between">
                  <span className="font-medium">Drying Time:</span>
                  <span>{detail.dryingTime}</span>
                </div>
              )}
              {detail.bondQuality && (
                <div className="flex justify-between">
                  <span className="font-medium">Bond Quality:</span>
                  <span>{detail.bondQuality}</span>
                </div>
              )}
            </>
          )}

          {/* Quality Department specific fields */}
          {step.stepName === 'QualityDept' && (
            <>
              
              {detail.testType && (
                <div className="flex justify-between">
                  <span className="font-medium">Test Type:</span>
                  <span>{detail.testType}</span>
                </div>
              )}
              {detail.passQuantity && (
                <div className="flex justify-between">
                  <span className="font-medium">Pass Quantity:</span>
                  <span>{detail.passQuantity}</span>
                </div>
              )}
              {detail.rejectedQty && (
                <div className="flex justify-between">
                  <span className="font-medium">Rejected Quantity:</span>
                  <span>{detail.rejectedQty}</span>
                </div>
              )}
              {detail.reasonForRejection && (
                <div className="flex justify-between">
                  <span className="font-medium">Reason for rejection:</span>
                  <span>{detail.reasonForRejection}</span>
                </div>
              )}
              {detail.qualityGrade && (
                <div className="flex justify-between">
                  <span className="font-medium">Quality Grade:</span>
                  <span>{detail.qualityGrade}</span>
                </div>
              )}
              {detail.defectType && (
                <div className="flex justify-between">
                  <span className="font-medium">Defect Type:</span>
                  <span>{detail.defectType}</span>
                </div>
              )}
            </>
          )}

          {/* Dispatch Process specific fields */}
          {step.stepName === 'DispatchProcess' && (
            <>
              {detail.balanceQty && (
                <div className="flex justify-between">
                  <span className="font-medium">Balance Quantity:</span>
                  <span>{detail.balanceQty}</span>
                </div>
              )}
              {detail.dispatchNo && (
                <div className="flex justify-between">
                  <span className="font-medium">Dispatch Number:</span>
                  <span>{detail.dispatchNo}</span>
                </div>
              )}
              {detail.driverName && (
                <div className="flex justify-between">
                  <span className="font-medium">Driver Name:</span>
                  <span>{detail.driverName}</span>
                </div>
              )}
              {detail.dispatchQuantity && (
                <div className="flex justify-between">
                  <span className="font-medium">Dispatch Qty:</span>
                  <span>{detail.dispatchQuantity}</span>
                </div>
              )}
              {detail.destination && (
                <div className="flex justify-between">
                  <span className="font-medium">Destination:</span>
                  <span>{detail.destination}</span>
                </div>
              )}
              {detail.dispatchDate && (
                <div className="flex justify-between">
                  <span className="font-medium">Dispatch Date:</span>
                  <span>{new Date(detail.dispatchDate).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}

          {/* Common date fields */}
          {detail.date && (
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date(detail.date).toLocaleDateString()}</span>
            </div>
          )}
          {detail.qcCheckAt && (
            <div className="flex justify-between">
              <span className="font-medium">QC Check:</span>
              <span>{new Date(detail.qcCheckAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Quality control fields */}
          {detail.qcCheckSignBy && (
            <div className="flex justify-between">
              <span className="font-medium">QC Signed By:</span>
              <span>{detail.qcCheckSignBy}</span>
            </div>
          )}

          {/* Shift information */}
          {detail.shift && (
            <div className="flex justify-between">
              <span className="font-medium">Shift:</span>
              <span>{detail.shift}</span>
            </div>
          )}
        </div>

        {/* Remarks - full width */}
        {detail.remarks && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="font-medium text-gray-600">Remarks:</span>
            <p className="text-gray-500 mt-1">{detail.remarks}</p>
          </div>
        )}
      </div>
    ))}
  </div>
)}

            </div>
          );
        });
      })()}
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