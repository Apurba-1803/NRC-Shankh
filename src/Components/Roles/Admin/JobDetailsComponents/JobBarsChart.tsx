import React from 'react';
import { TrendingUp, CheckCircle, PlayCircle, Clock } from 'lucide-react';

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



interface JobBarsChartProps {
  jobs: (CompletedJob | JobPlan)[];
  category: 'completed' | 'inProgress' | 'planned';
  onJobClick: (job: CompletedJob | JobPlan) => void;
  searchTerm: string;
}

const JobBarsChart: React.FC<JobBarsChartProps> = ({ 
  jobs, 
  category, 
  onJobClick, 
  searchTerm 
}) => {


  // Helper function to get company/customer name
  const getCompanyName = (job: CompletedJob | JobPlan) => {
    if ('company' in job) {
      return job.company;
    } else {
      return job.jobDetails?.customerName;
    }
  };

  // Helper function to get steps
  const getSteps = (job: CompletedJob | JobPlan) => {
    if ('steps' in job) {
      return job.steps;
    } else {
      return job.allSteps;
    }
  };
  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get category-specific styling
  const getCategoryStyles = () => {
    switch (category) {
      case 'completed':
        return {
          bgColor: 'bg-green-500 hover:bg-green-600',
          borderColor: 'border-green-600',
          icon: <CheckCircle className="h-4 w-4 text-white" />,
          label: 'Completed'
        };
      case 'inProgress':
        return {
          bgColor: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-600',
          icon: <PlayCircle className="h-4 w-4 text-white" />,
          label: 'In Progress'
        };
      case 'planned':
        return {
          bgColor: 'bg-gray-500 hover:bg-gray-600',
          borderColor: 'border-gray-600',
          icon: <Clock className="h-4 w-4 text-white" />,
          label: 'Planned'
        };
      default:
        return {
          bgColor: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-600',
          icon: <TrendingUp className="h-4 w-4 text-white" />,
          label: 'Unknown'
        };
    }
  };

  const styles = getCategoryStyles();

  if (filteredJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? 'No jobs found matching your search.' : `No ${styles.label.toLowerCase()} jobs found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-4">
        {styles.icon}
        <h3 className="text-lg font-semibold text-gray-800">
          {styles.label} Jobs ({filteredJobs.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredJobs.map((job, index) => (
          <div
            key={job.id || index}
            onClick={() => onJobClick(job)}
            className={`
              ${styles.bgColor} ${styles.borderColor}
              border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
              transform hover:scale-105 hover:shadow-lg
              text-white
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{job.nrcJobNo}</h4>
                <p className="text-xs opacity-90">
                  {getCompanyName(job) || 'N/A'}
                </p>
                {'completedBy' in job && job.completedBy && (
                  <p className="text-xs opacity-75 mt-1">
                    Completed by: {job.completedBy}
                  </p>
                )}
              </div>
              
              <div className="text-right text-xs opacity-90">
                <div className="mb-1">
                  {job.createdAt && (
                    <p>Created: {new Date(job.createdAt).toLocaleDateString()}</p>
                  )}
                  {'completedAt' in job && job.completedAt && (
                    <p>Completed: {new Date(job.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
                {'totalDuration' in job && (job as any).totalDuration && (
                  <p>Duration: {(job as any).totalDuration} days</p>
                )}
              </div>
            </div>
            {/* Progress indicator for in-progress jobs */}
            {category === 'inProgress' && getSteps(job) && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{getSteps(job)?.filter((step: any) => (step.status || step.finalStatus) === 'completed').length || 0}/{getSteps(job)?.length || 0}</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((getSteps(job)?.filter((step: any) => (step.status || step.finalStatus) === 'completed').length || 0) / (getSteps(job)?.length || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobBarsChart; 