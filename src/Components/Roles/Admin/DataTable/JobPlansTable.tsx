import React, { useState } from 'react';
import { Eye, Search, Filter as FilterIcon } from 'lucide-react';

interface JobPlanStep {
  id: number;
  stepNo: number;
  stepName: string;
  machineDetails: Array<{
    unit: string | null;
    machineId: string | number;
    machineCode: string | null;
    machineType: string;
    machine?: {
      id: string;
      description: string;
      status: string;
      capacity: number;
    };
  }>;
  status: 'planned' | 'start' | 'stop';
  startDate: string | null;
  endDate: string | null;
  user: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  steps: JobPlanStep[];
}

interface JobPlansTableProps {
  jobPlans: JobPlan[];
  onViewDetails: (jobPlan: JobPlan) => void;
  className?: string;
}

const JobPlansTable: React.FC<JobPlansTableProps> = ({
  jobPlans,
  // onViewDetails,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [demandFilter, setDemandFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'inProgress' | 'planned'>('all');
  const [selectedJobPlan, setSelectedJobPlan] = useState<JobPlan | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleViewDetails = (jobPlan: JobPlan) => {
  setSelectedJobPlan(jobPlan);
  setIsModalOpen(true);
};


  // Filter job plans based on search and filters
  const filteredJobPlans = jobPlans.filter(jobPlan => {
    const matchesSearch = jobPlan.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDemand = demandFilter === 'all' || jobPlan.jobDemand === demandFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const hasInProgress = jobPlan.steps.some(step => step.status === 'start');
      const allCompleted = jobPlan.steps.every(step => step.status === 'stop');
      
      if (statusFilter === 'completed') matchesStatus = allCompleted;
      else if (statusFilter === 'inProgress') matchesStatus = hasInProgress;
      else if (statusFilter === 'planned') matchesStatus = !hasInProgress && !allCompleted;
    }

    return matchesSearch && matchesDemand && matchesStatus;
  });

  const getJobStatus = (jobPlan: JobPlan) => {
    const hasInProgress = jobPlan.steps.some(step => step.status === 'start');
    const allCompleted = jobPlan.steps.every(step => step.status === 'stop');
    
    if (allCompleted) return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    if (hasInProgress) return { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Planned', color: 'bg-gray-100 text-gray-800' };
  };

  const getProgressPercentage = (jobPlan: JobPlan) => {
    const completedSteps = jobPlan.steps.filter(step => step.status === 'stop').length;
    const totalSteps = jobPlan.steps.length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  // console.log("filtered job", filteredJobPlans)

  const getStatusStyle = (status:string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  const formatDate = (dateString:string|null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

    const formatStepName = (stepName: string): string => {
    return stepName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle consecutive capitals
      .trim();
  };

  {console.log("selected job", selectedJobPlan)}

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Job Cards Overview</h3>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search job plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] w-full sm:w-64"
            />
          </div>

          {/* Demand Filter */}
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
          >
            <option value="all">All Demands</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="inProgress">In Progress</option>
            <option value="planned">Planned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            
            {filteredJobPlans.map((jobPlan) => {
              const status = getJobStatus(jobPlan);
              const progressPercentage = getProgressPercentage(jobPlan);
              
              return (
                <tr key={jobPlan.jobPlanId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{jobPlan.nrcJobNo}</div>
                    <div className="text-sm text-gray-500">ID: {jobPlan.jobPlanId}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      jobPlan.jobDemand === 'high' ? 'bg-red-100 text-red-800' :
                      jobPlan.jobDemand === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {jobPlan.jobDemand}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-[#00AEEF] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {jobPlan.steps.filter(step => step.status === 'stop').length}/{jobPlan.steps.length} steps
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(jobPlan.createdAt).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(jobPlan)}
                      className="text-[#00AEEF] hover:text-[#0099cc] transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        

        {isModalOpen && selectedJobPlan && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]">
      
      {/* Close button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Header */}
      <h2 className="text-xl font-semibold mb-4">Job Card Details</h2>

      {/* Basic Info */}
      {/* Basic Info */}
<div className="grid grid-cols-2 gap-4 mb-6">
  {[
    { label: "Job Card No", value: selectedJobPlan.nrcJobNo, color: "blue" },
    { label: "Job Card ID", value: selectedJobPlan.jobPlanId, color: "green" },
    { label: "Demand", value: selectedJobPlan.jobDemand, color: "purple" },
    { label: "Created", value: new Date(selectedJobPlan.createdAt).toLocaleString(), color: "orange" },
  ].map((item, i) => (
    <div
      key={i}
      className={`flex flex-col p-3 rounded-md shadow-sm border-l-4 border-${item.color}-500 bg-white`}
    >
      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {item.label}
      </span>
      <span className="text-sm font-semibold text-gray-900 mt-0.5">
        {item.value || "-"}
      </span>
    </div>
  ))}
</div>




      {/* Steps */}
      <h3 className="text-lg font-medium mb-2">Steps</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
       <thead className="bg-gradient-to-r from-emerald-50 to-green-100 sticky top-0">

  <tr>
    {["Step No", "Step Name", "Status", "Machine", "Capacity", "Start Date", "End Date", "User"].map((col, i) => (
      <th
        key={i}
        className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 uppercase tracking-wide"
      >
        {col}
      </th>
    ))}
  </tr>
</thead>
<tbody className="divide-y divide-gray-200">
  {selectedJobPlan.steps.map((step) => (
    <tr key={step.id} className="hover:bg-indigo-50 transition-colors">
      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{step.stepNo}</td>
      <td className="px-6 py-4 text-sm">{formatStepName(step.stepName)}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(step.status)}`}>
          {step.status.charAt(0).toUpperCase() + step.status.slice(1).replace('-', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{step.machineDetails?.[0]?.machineType || '-'}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{step.machineDetails?.[0]?.machine?.capacity || '-'}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(step.startDate)}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(step.endDate)}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{step.user || '-'}</td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  </div>
)}

        
        {filteredJobPlans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FilterIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No job plans found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPlansTable; 