import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StepDetailsModal from './StepDetailsModal';
import UpdateStatusModal from './UpdateStatusModal';
import EditMachineModal from './EditMachineModal';
import ViewDetailsModal from './ViewDetailsModal';
import EditDetailsModal from './EditDetailsModal';

interface MachineDetail {
  unit: string | null;
  machineId: string;
  machineCode: string | null;
  machineType: string;
  machine?: {
    id: string;
    description: string;
    status: string;
    capacity: number;
  };
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

interface StepDetails {
  paperStore?: any;
  printingDetails?: any;
  corrugation?: any;
  fluteLaminate?: any;
  punching?: any;
  sideFlapPasting?: any;
  qualityDept?: any;
  dispatchProcess?: any;
}

const EditWorkingDetails: React.FC = () => {
  const [jobs, setJobs] = useState<JobPlan[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPlan | null>(null);
  const [showStepDetailsModal, setShowStepDetailsModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showEditMachineModal, setShowEditMachineModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<JobStep | null>(null);
  const [stepDetails, setStepDetails] = useState<StepDetails>({});
  const [selectedStepData, setSelectedStepData] = useState<any>(null);
  const [selectedStepName, setSelectedStepName] = useState<string>('');

  // Debug logging
  console.log('EditWorkingDetails component rendered');
  console.log('Current state:', { jobs, filteredJobs, loading, error });

  // Fetch jobs on component mount
  useEffect(() => {
    console.log('EditWorkingDetails useEffect triggered');
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    console.log('fetchJobs function called');
    try {
      setLoading(true);
      console.log('Making API call to fetch jobs...');
      
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      console.log('Access token:', accessToken ? 'Present' : 'Missing');
      
      const response = await fetch('https://nrprod.nrcontainers.com/api/job-planning/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API response received:', response);
      const data = await response.json();
      console.log('API data:', data);
      
      if (data.success) {
        // Filter jobs that have steps with "stop" or "start" status
        const jobsWithStoppedOrStartedSteps = data.data.filter((job: JobPlan) => 
          job.steps.some(step => step.status === 'stop' || step.status === 'start')
        );
        console.log('Filtered jobs:', jobsWithStoppedOrStartedSteps);
        
        setJobs(jobsWithStoppedOrStartedSteps);
        setFilteredJobs(jobsWithStoppedOrStartedSteps);
      }
    } catch (err) {
      console.error('Error in fetchJobs:', err);
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
      console.log('fetchJobs completed, loading set to false');
    }
  };

  const handleJobCardClick = async (job: JobPlan) => {
    setSelectedJob(job);
    setShowStepDetailsModal(true);
    await fetchStepDetails(job.nrcJobNo);
  };

  const fetchStepDetails = async (nrcJobNo: string) => {
    try {
      const stepTypes = [
        'paper-store',
        'printing-details', 
        'corrugation',
        'flute-laminate-board-conversion',
        'punching',
        'side-flap-pasting',
        'quality-dept',
        'dispatch-process'
      ];

      const details: StepDetails = {};

      for (const stepType of stepTypes) {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const response = await fetch(`https://nrprod.nrcontainers.com/api/${stepType}/by-job/${encodeURIComponent(nrcJobNo)}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            details[stepType.replace(/-/g, '') as keyof StepDetails] = data;
          }
        } catch (err) {
          console.error(`Error fetching ${stepType} details:`, err);
        }
      }

      setStepDetails(details);
    } catch (err) {
      console.error('Error fetching step details:', err);
    }
  };

  const handleUpdateStatus = (step: JobStep) => {
    setSelectedStep(step);
    setShowUpdateStatusModal(true);
  };

  const handleEditMachine = (step: JobStep) => {
    setSelectedStep(step);
    setShowEditMachineModal(true);
  };

  const handleViewDetails = async (step: JobStep) => {
    try {
      setSelectedStep(step);
      setSelectedStepName(step.stepName);
      
      // Map step names to API endpoints
      const stepTypeMap: { [key: string]: string } = {
        'PaperStore': 'paper-store',
        'PrintingDetails': 'printing-details',
        'Corrugation': 'corrugation',
        'FluteLaminateBoardConversion': 'flute-laminate-board-conversion',
        'Punching': 'punching',
        'SideFlapPasting': 'side-flap-pasting',
        'QualityDept': 'quality-dept',
        'DispatchProcess': 'dispatch-process'
      };

      const stepType = stepTypeMap[step.stepName];
      if (!stepType) {
        console.error('Unknown step type:', step.stepName);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = `https://nrprod.nrcontainers.com/api/${stepType}/by-job/${encodeURIComponent(selectedJob!.nrcJobNo)}`;
      console.log('🔍 Fetching from URL:', apiUrl);
      console.log('🔍 Job NRC:', selectedJob!.nrcJobNo);
      console.log('🔍 Encoded Job NRC:', encodeURIComponent(selectedJob!.nrcJobNo));
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setSelectedStepData(result.data[0]);
          setShowViewDetailsModal(true);
        } else {
          console.error('No data found for step:', step.stepName);
          alert(`No data found for ${step.stepName} step`);
        }
      } else {
        console.error('Failed to fetch step details:', response.status, response.statusText);
        alert(`Failed to fetch ${step.stepName} details: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching step details:', err);
      alert(`Error fetching ${step.stepName} details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditDetails = () => {
    setShowViewDetailsModal(false);
    setShowEditDetailsModal(true);
  };

  const handleUpdateDetails = async (updatedData: any) => {
    try {
      // Map step names to API endpoints
      const stepTypeMap: { [key: string]: string } = {
        'PaperStore': 'paper-store',
        'PrintingDetails': 'printing-details',
        'Corrugation': 'corrugation',
        'FluteLaminateBoardConversion': 'flute-laminate-board-conversion',
        'Punching': 'punching',
        'SideFlapPasting': 'side-flap-pasting',
        'QualityDept': 'quality-dept',
        'DispatchProcess': 'dispatch-process'
      };

      const stepType = stepTypeMap[selectedStepName];
      if (!stepType) {
        throw new Error('Unknown step type');
      }

      const accessToken = localStorage.getItem('accessToken');
      
      // Try the ALB URL first, then fallback to onrender.com
      let putUrl = `https://nrprod.nrcontainers.com/api/${stepType}/${encodeURIComponent(updatedData.jobNrcJobNo)}`;
      let response = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      // If ALB fails, try onrender.com
      if (!response.ok) {
        console.log('🔍 ALB PUT failed, trying onrender.com...');
        putUrl = `https://nrprod.nrcontainers.com/api/${stepType}/${encodeURIComponent(updatedData.jobNrcJobNo)}`;
        console.log('🔍 PUT request to onrender.com URL:', putUrl);
        
        response = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        });
      }
      
      console.log('🔍 PUT request to URL:', putUrl);
      console.log('🔍 PUT payload:', updatedData);
      console.log('🔍 Step Type:', stepType);
      console.log('🔍 Job NRC:', updatedData.jobNrcJobNo);
      console.log('🔍 Encoded Job NRC:', encodeURIComponent(updatedData.jobNrcJobNo));
      
      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }

      // Refresh the data
      await fetchStepDetails(selectedJob!.nrcJobNo);
      setShowEditDetailsModal(false);
    } catch (err) {
      console.error('Error updating step details:', err);
      throw err;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Working Details</h1>
        
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            Debug: Loading: {loading.toString()}, Error: {error || 'none'}, Jobs: {jobs.length}, Filtered: {filteredJobs.length}
          </p>
        </div>
        
        {/* Stopped Jobs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Stopped Jobs</h2>
            <span className="text-gray-600">{filteredJobs.length} Stopped Jobs</span>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No stopped or started jobs found</p>
                {loading && <p className="text-sm text-gray-400 mt-2">Loading...</p>}
                {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
              </div>
            ) : (
              filteredJobs.map((job) => {
                const stoppedSteps = job.steps.filter(step => step.status === 'stop' || step.status === 'start');
                
                return (
                  <div 
                    key={job.jobPlanId}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleJobCardClick(job)}
                  >
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {job.nrcJobNo.length > 25 ? `${job.nrcJobNo.substring(0, 25)}...` : job.nrcJobNo}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Plan ID: {job.jobPlanId}</span>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Created: {formatDate(job.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Updated: {formatDate(job.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(job.jobDemand)}`}>
                        {job.jobDemand ? `${job.jobDemand.charAt(0).toUpperCase() + job.jobDemand.slice(1)} Priority` : 'No Priority'}
                      </span>
                    </div>

                    {/* Stopped Steps */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900">
                          Stopped Steps ({stoppedSteps.length})
                        </h4>
                        <ChevronDownIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Step Details Modal */}
      {showStepDetailsModal && selectedJob && (
        <StepDetailsModal
          job={selectedJob}
          stepDetails={stepDetails}
          onClose={() => setShowStepDetailsModal(false)}
          onUpdateStatus={handleUpdateStatus}
          onEditMachine={handleEditMachine}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedStep && (
        <UpdateStatusModal
          step={selectedStep}
          job={selectedJob!}
          onClose={() => setShowUpdateStatusModal(false)}
          onUpdate={fetchJobs}
        />
      )}

      {/* Edit Machine Modal */}
      {showEditMachineModal && selectedStep && (
        <EditMachineModal
          step={selectedStep as any} // Type cast to avoid type mismatch
          job={selectedJob as any} // Type cast to avoid type mismatch 
          onClose={() => setShowEditMachineModal(false)}
          onUpdate={fetchJobs}
        />
      )}

      {/* View Details Modal */}
      {showViewDetailsModal && selectedStepData && (
        <ViewDetailsModal
          isOpen={showViewDetailsModal}
          onClose={() => setShowViewDetailsModal(false)}
          stepName={selectedStepName}
          stepData={selectedStepData}
          onEditDetails={handleEditDetails}
        />
      )}

      {/* Edit Details Modal */}
      {showEditDetailsModal && selectedStepData && (
        <EditDetailsModal
          isOpen={showEditDetailsModal}
          onClose={() => setShowEditDetailsModal(false)}
          stepName={selectedStepName}
          stepData={selectedStepData}
          onUpdate={handleUpdateDetails}
        />
      )}
    </div>
  );
};

export default EditWorkingDetails; 