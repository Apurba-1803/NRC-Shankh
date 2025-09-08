import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import JobSearchBar from './JobDetailsComponents/JobSearchBar';
import JobBarsChart from './JobDetailsComponents/JobBarsChart';
import DetailedJobModal from './JobDetailsComponents/DetailedJobModal';

interface JobPlan {
  id: number;
  nrcJobNo: string;
  company: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
  status: string;
  steps: JobPlanStep[];
  createdAt: string;
}

interface JobPlanStep {
  id: number;
  stepName: string;
  status: string;
  stepDetails?: any;
}

const PlannedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plannedJobs, setPlannedJobs] = useState<JobPlan[]>([]);

  // Fetch planned jobs data
  const fetchPlannedJobs = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      // Fetch job planning data
      const jobPlanningResponse = await fetch('https://nrprod.nrcontainers.com/api/job-planning/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!jobPlanningResponse.ok) {
        throw new Error(`Failed to fetch job planning data: ${jobPlanningResponse.status}`);
      }

      const jobPlanningResult = await jobPlanningResponse.json();
      
      if (jobPlanningResult.success && Array.isArray(jobPlanningResult.data)) {
        // Filter only planned jobs
        const planned = jobPlanningResult.data.filter((job: JobPlan) => 
          !job.steps.some(step => step.status === 'start')
        );
        setPlannedJobs(planned);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch planned jobs');
      console.error('Planned jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedJobs();
  }, []);

  const handleJobClick = (job: JobPlan) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading planned jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Planned Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPlannedJobs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <JobSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by NRC Job Number..."
          />
        </div>

        {/* Planned Jobs Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gray-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Planned Jobs</h3>
              <p className="text-3xl font-bold text-gray-600">{plannedJobs.length}</p>
            </div>
          </div>
          
          <JobBarsChart
            jobs={plannedJobs}
            category="planned"
            onJobClick={handleJobClick}
            searchTerm={searchTerm}
          />
        </div>

        {/* Detailed Job Modal */}
        <DetailedJobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
        />
      </div>
    </div>
  );
};

export default PlannedJobs; 