// src/Components/Roles/Planner/EditMachinePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit3 } from 'lucide-react';
import EditMachineModal from './modal/EditMachineModal';
import { type Job, type JobPlan, type JobPlanStep } from './Types/job';
import LoadingSpinner from '../../common/LoadingSpinner';

interface EditMachinePageProps {}

const EditMachinePage: React.FC<EditMachinePageProps> = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobPlan, setJobPlan] = useState<JobPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      console.log('EditMachinePage: Checking authentication...');
      const accessToken = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      console.log('EditMachinePage: Access token exists:', !!accessToken);
      console.log('EditMachinePage: User data exists:', !!userData);
      
      if (!accessToken || !userData) {
        console.error('EditMachinePage: Authentication data missing, redirecting to login');
        navigate('/login');
        return;
      }
      
      try {
        // Verify token is valid by checking if it's not expired
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        console.log('EditMachinePage: Token expiry:', new Date(tokenData.exp * 1000));
        console.log('EditMachinePage: Current time:', new Date(currentTime * 1000));
        
        if (tokenData.exp < currentTime) {
          console.error('EditMachinePage: Token expired, redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userData');
          navigate('/login');
          return;
        }
        
        console.log('EditMachinePage: Authentication successful');
        setIsAuthenticated(true);
      } catch (err) {
        console.error('EditMachinePage: Token validation failed:', err);
        // Don't redirect immediately, show error instead
        setError('Authentication validation failed. Please try refreshing the page.');
        console.log('EditMachinePage: Showing error instead of redirecting');
      }
    };

    // Add a small delay to ensure localStorage is accessible
    setTimeout(checkAuth, 100);
  }, [navigate]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
                  <LoadingSpinner size="md" text="Checking authentication..." />
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter an NRC Job Number to search');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      setSelectedJob(null);
      setJobPlan(null);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      // Search for jobs by NRC Job Number
      const response = await fetch(`https://nrprod.nrcontainers.com/api/jobs?nrcJobNo=${encodeURIComponent(searchTerm.trim())}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to search jobs: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const filteredJobs = result.data.filter((job: Job) => job.status === 'ACTIVE');
        setSearchResults(filteredJobs);
        
        if (filteredJobs.length === 0) {
          setError('No active jobs found with this NRC Job Number');
        }
      } else {
        setError('No jobs found with this NRC Job Number');
      }
    } catch (err) {
      setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = async (job: Job) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedJob(job);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      console.log("nrc job no", job.nrcJobNo)
      // Fetch job plan for the selected job
      const response = await fetch(`https://nrprod.nrcontainers.com/api/job-planning/${encodeURIComponent(job.nrcJobNo)}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setJobPlan(result.data);
        } else {
          setError('No job plan found for this job');
        }
      } else {
        setError('Failed to fetch job plan');
      }
    } catch (err) {
      setError(`Failed to load job plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMachine = () => {
    if (selectedJob && jobPlan) {
      setShowEditModal(true);
    }
  };

  const handleSaveMachineAssignments = async (updatedSteps: JobPlanStep[]) => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      // Update job plan with new machine assignments
      const response = await fetch(`https://nrprod.nrcontainers.com/api/job-planning/${encodeURIComponent(selectedJob!.nrcJobNo)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps: updatedSteps,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update job plan: ${response.status}`);
      }

      // Refresh job plan data
      await handleJobSelect(selectedJob!);
      setShowEditModal(false);
      
    } catch (err) {
      setError(`Failed to save machine assignments: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Machine Assignments</h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Search for Jobs</h2>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter NRC Job Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0099cc] transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Search size={20} />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
            
            <div className="space-y-4">
              {searchResults.map((job) => (
                <div 
                  key={job.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedJob?.id === job.id 
                      ? 'border-[#00AEEF] bg-[#00AEEF]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleJobSelect(job)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{job.nrcJobNo}</h4>
                      <p className="text-sm text-gray-600">Customer: {job.customerName}</p>
                      <p className="text-sm text-gray-600">Status: {job.status}</p>
                      <p className="text-sm text-gray-600">Board Size: {job.boardSize}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Job Details */}
        {selectedJob && jobPlan && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Job: {selectedJob.nrcJobNo}
              </h3>
              <button
                onClick={handleEditMachine}
                disabled={loading}
                className="px-6 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0099cc] transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Edit3 size={20} />
                <span>Edit Machine Assignments</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Job Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Customer:</span> {selectedJob.customerName}</p>
                  <p><span className="font-medium">Board Size:</span> {selectedJob.boardSize}</p>
                  <p><span className="font-medium">Status:</span> {selectedJob.status}</p>
                  <p><span className="font-medium">Job Demand:</span> {jobPlan.jobDemand || 'Not Set'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Production Steps</h4>
                <div className="space-y-2">
                  {jobPlan.steps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{step.stepName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        step.machineDetails && step.machineDetails.length > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {step.machineDetails && step.machineDetails.length > 0 ? 'Assigned' : 'Not Assigned'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Machine Modal */}
        {showEditModal && selectedJob && jobPlan && (
          <EditMachineModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            jobNrcNo={selectedJob.nrcJobNo}
            jobSteps={jobPlan.steps}
            onSave={handleSaveMachineAssignments}
          />
        )}
      </div>
    </div>
  );
};

export default EditMachinePage; 