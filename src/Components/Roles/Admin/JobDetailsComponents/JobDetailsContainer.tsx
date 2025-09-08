import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import JobSearchBar from './JobSearchBar';
import JobBarsChart from './JobBarsChart';
import DetailedJobModal from './DetailedJobModal';

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

interface CompletedJob {
  id: number;
  nrcJobNo: string;
  jobPlanId: number;
  jobDemand: string;
  jobDetails: {
    id: number;
    srNo: number;
    noUps: string;
    width: number;
    height: string;
    length: number;
    status: string;
    preRate: number;
    styleId: string;
    clientId: string;
    boardSize: string;
    jobDemand: string;
    customerName: string;
    boxDimensions: string;
    processColors: string;
    artworkApprovedDate: string;
    artworkReceivedDate: string;
    shadeCardApprovalDate: string;
  };
  purchaseOrderDetails: {
    id: number;
    unit: string;
    poDate: string;
    status: string;
    customer: string;
    poNumber: string;
    noOfSheets: number;
    totalPOQuantity: number;
    deliveryDate: string;
  };
  allSteps: Array<{
    id: number;
    stepName: string;
    status: string;
    startDate: string;
    endDate: string;
    machineDetails: Array<{
      unit: string;
      machineId: string;
      machineCode: string;
      machineType: string;
    }>;
  }>;
  completedAt: string;
  completedBy: string;
  finalStatus: string;
  createdAt: string;
}

interface JobDetailsContainerProps {
  // This will be populated from route params or API call
}

const JobDetailsContainer: React.FC<JobDetailsContainerProps> = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<'completed' | 'inProgress' | 'planned' | null>(null);
  const [isDirectCompleted, setIsDirectCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<CompletedJob | JobPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for real job data
  const [jobPlans, setJobPlans] = useState<JobPlan[]>([]);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  
  // Note: jobData from location state is not used in this component
  // as we fetch real data from APIs

  // Fetch real job data from APIs
  const fetchJobData = async () => {
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
      
      // Fetch completed jobs data with better error handling
      let completedJobsData: CompletedJob[] = [];
      try {
        const completedJobsResponse = await fetch('https://nrprod.nrcontainers.com/api/completed-jobs', {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        });

        if (completedJobsResponse.status === 401) {
          console.warn('Authentication failed for completed-jobs API. Token may be expired.');
          // Don't throw error, just set empty array
          completedJobsData = [];
        } else if (completedJobsResponse.ok) {
          const completedJobsResult = await completedJobsResponse.json();
          if (completedJobsResult.success && Array.isArray(completedJobsResult.data)) {
            completedJobsData = completedJobsResult.data;
          }
        } else {
          console.warn(`Completed jobs API returned status: ${completedJobsResponse.status}`);
          completedJobsData = [];
        }
      } catch (completedJobsError) {
        console.warn('Failed to fetch completed jobs:', completedJobsError);
        // Don't fail the entire request, just set empty array
        completedJobsData = [];
      }

      if (jobPlanningResult.success && Array.isArray(jobPlanningResult.data)) {
        setJobPlans(jobPlanningResult.data);
        setCompletedJobs(completedJobsData);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job data');
      console.error('Job data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
    
    // Check if we should go directly to completed jobs view
    const directToCompleted = localStorage.getItem('directToCompleted');
    console.log('JobDetailsContainer localStorage directToCompleted:', directToCompleted);
    if (directToCompleted === 'true') {
      console.log('Setting isDirectCompleted to true');
      setIsDirectCompleted(true);
      // Clear the localStorage after using it
      localStorage.removeItem('directToCompleted');
    }
  }, []);

  // Categorize jobs
  const getJobsByCategory = () => {
    const completed: CompletedJob[] = completedJobs;
    const inProgress: JobPlan[] = jobPlans.filter(job => 
      job.steps.some(step => step.status === 'start')
    );
    const planned: JobPlan[] = jobPlans.filter(job => 
      !job.steps.some(step => step.status === 'start')
    );

    return { completed, inProgress, planned };
  };

  const { completed, inProgress, planned } = getJobsByCategory();

  const handleCategoryClick = (category: 'completed' | 'inProgress' | 'planned') => {
    setSelectedCategory(category);
    setIsDirectCompleted(false);
    setSearchTerm(''); // Reset search when changing category
    setSelectedJob(null); // Reset selected job
    setIsModalOpen(false); // Close any open modal
  };

  const handleDirectCompletedClick = () => {
    setIsDirectCompleted(true);
    setSelectedCategory(null);
    setSearchTerm(''); // Reset search
    setSelectedJob(null); // Reset selected job
    setIsModalOpen(false); // Close any open modal
  };

  const handleJobClick = (job: CompletedJob | JobPlan) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setIsDirectCompleted(false);
    setSearchTerm('');
  };

  const handleBackFromDirectCompleted = () => {
    setIsDirectCompleted(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchJobData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show direct completed jobs view (bypassing category selection)
  console.log('Current state - isDirectCompleted:', isDirectCompleted, 'selectedCategory:', selectedCategory);
  if (isDirectCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header with Back Button */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={handleBackFromDirectCompleted}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {/* Search Bar - Only for completed jobs */}
          <div className="mb-8">
            <JobSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by NRC Job Number..."
            />
          </div>

          {/* Job Bars for Completed Jobs */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Completed Jobs</h3>
                <p className="text-3xl font-bold text-green-600">{completed.length}</p>
              </div>
            </div>
            
            <JobBarsChart
              jobs={completed}
              category="completed"
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
  }

  // Show category view (bars + search) when a category is selected
  if (selectedCategory) {
    const categoryData = {
      completed: { jobs: completed, title: 'Completed Jobs', icon: <CheckCircle className="h-6 w-6" />, color: 'green' },
      inProgress: { jobs: inProgress, title: 'In Progress Jobs', icon: <PlayCircle className="h-6 w-6" />, color: 'yellow' },
      planned: { jobs: planned, title: 'Planned Jobs', icon: <Clock className="h-6 w-6" />, color: 'gray' }
    };

    const currentCategory = categoryData[selectedCategory];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header with Back Button */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={handleBackToCategories}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>Back to Categories</span>
            </button>
          </div>

          {/* Search Bar - Only for this category */}
          <div className="mb-8">
            <JobSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by NRC Job Number..."
            />
          </div>

          {/* Job Bars for Selected Category */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`bg-${currentCategory.color}-100 p-3 rounded-full`}>
                {currentCategory.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{currentCategory.title}</h3>
                <p className="text-3xl font-bold text-green-600">{currentCategory.jobs.length}</p>
              </div>
            </div>
            
            <JobBarsChart
              jobs={currentCategory.jobs}
              category={selectedCategory}
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
  }

  // Show main dashboard with category grid cards
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
          {/* <h1 className="text-3xl font-bold text-gray-800">Job Details Overview</h1> */}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp size={32} />
            <div>
              <h2 className="text-2xl font-bold">Total Jobs</h2>
              <p className="text-blue-100">Complete overview of all job categories</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-4xl font-bold">{completed.length + inProgress.length + planned.length}</div>
              <div className="text-blue-100">Total Count</div>
            </div>
          </div>
        </div>

        {/* Job Category Cards - Clickable Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Completed Jobs Card */}
          <div 
            onClick={handleDirectCompletedClick}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                {/* <h3 className="text-lg font-semibold text-gray-800">Completed Jobs</h3> */}
                <p className="text-3xl font-bold text-green-600">{completed.length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Click to view all completed jobs</p>
          </div>

          {/* In Progress Jobs Card */}
          <div 
            onClick={() => handleCategoryClick('inProgress')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <PlayCircle className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">In Progress</h3>
                <p className="text-3xl font-bold text-yellow-600">{inProgress.length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Click to view all active jobs</p>
          </div>

          {/* Planned Jobs Card */}
          <div 
            onClick={() => handleCategoryClick('planned')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Clock className="text-gray-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Planned Jobs</h3>
                <p className="text-3xl font-bold text-gray-600">{planned.length}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Click to view all planned jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsContainer; 