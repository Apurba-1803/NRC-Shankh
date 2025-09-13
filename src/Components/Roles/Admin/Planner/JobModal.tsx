// JobModal.tsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Job {
    nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  status: string;
  poStatus: string;
  machineDetailsStatus: string;
  artworkStatus: string;
  overallProgress: number;
  createdAt: string | null;
  updatedAt: string;
  poCount: number;
  artworkCount: number;
  hasMachineDetails: boolean;
}

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  jobs: Job[];
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, title, jobs }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

 return (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    {/* Simplified backdrop */}
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    />
    
    {/* Mobile-first responsive container */}
    <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Simplified header */}
        <div className="bg-gray-900 text-white px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h2>
              <p className="text-gray-300 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* Mobile-optimized content area */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-160px)] bg-gray-50">
          {jobs.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <p className="text-gray-500 text-lg sm:text-xl font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {jobs.map((job, index) => {
                const getPriorityStatus = (job: Job) => {
                  if (job.artworkStatus === 'pending') {
                    return {
                      label: 'Artwork: Pending',
                      style: 'bg-red-50 text-red-700 border-red-200',
                      icon: '🎨'
                    };
                  }
                  
                  if (job.poStatus === 'pending') {
                    return {
                      label: 'PO: Pending', 
                      style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                      icon: '📋'
                    };
                  }
                  
                  if (job.machineDetailsStatus === 'pending') {
                    return {
                      label: 'Machine Details: Pending',
                      style: 'bg-orange-50 text-orange-700 border-orange-200',
                      icon: '⚙️'
                    };
                  }
                  
                  return {
                    label: 'All Completed',
                    style: 'bg-green-50 text-green-700 border-green-200',
                    icon: '✅'
                  };
                };

                const priorityStatus = getPriorityStatus(job);

                return (
                  <div 
                    key={job.nrcJobNo || index}
                    className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    {/* Mobile-first layout */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      <div className="flex-1">
                        {/* Customer name section - mobile optimized */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                            {job.customerName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl leading-tight break-words">
                              {job.customerName}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Style/SKU - mobile optimized */}
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                          <p className="text-gray-700 font-medium text-xs sm:text-sm leading-relaxed break-words">
                            {job.styleItemSKU}
                          </p>
                        </div>
                        
                        {/* Mobile-first badges layout */}
                        <div className="space-y-2">
                          {/* Job number badge */}
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium border border-blue-200">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              <span className="break-all">{job.nrcJobNo}</span>
                            </span>
                          </div>
                          
                          {/* Status badge */}
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-lg font-medium border ${priorityStatus.style}`}>
                              <span>{priorityStatus.icon}</span>
                              <span>{priorityStatus.label}</span>
                            </span>
                          </div>
                          
                          {/* Progress indicator - mobile optimized */}
                          {job.overallProgress && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[120px] sm:max-w-none">
                                <div 
                                  className="h-full bg-gray-600 transition-all duration-300"
                                  style={{ width: `${job.overallProgress}%` }}
                                ></div>
                              </div>
                              <span className="font-medium text-gray-700">{job.overallProgress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Date section - mobile optimized */}
                      <div className="sm:text-right sm:ml-4 mt-2 sm:mt-0">
                        <div className="bg-gray-100 rounded-lg p-2 sm:p-3 text-center sm:min-w-[100px]">
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
                            {job.createdAt ? 'Created' : 'Updated'}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-800">
                            {job.createdAt ? formatDate(job.createdAt) : formatDate(job.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Simplified footer - mobile responsive */}
        <div className="bg-white border-t border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600">
            {/* Statistics - mobile stacked layout */}
            <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs sm:text-sm">Completed: {jobs.filter(j => j.poStatus === 'completed' && j.artworkStatus === 'completed' && j.machineDetailsStatus === 'completed').length}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-xs sm:text-sm">In Progress: {jobs.filter(j => 
                  (j.poStatus === 'pending' || j.artworkStatus === 'pending' || j.machineDetailsStatus === 'pending') &&
                  !(j.poStatus === 'pending' && j.artworkStatus === 'pending' && j.machineDetailsStatus === 'pending')
                ).length}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-xs sm:text-sm">Not Started: {jobs.filter(j => j.poStatus === 'pending' && j.artworkStatus === 'pending' && j.machineDetailsStatus === 'pending').length}</span>
              </span>
            </div>
            
            {/* Close button - mobile full width option */}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);


};

export default JobModal;
