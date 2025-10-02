import React, { useState, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell,  Tooltip, ResponsiveContainer } from 'recharts';
import JobAssigned from '../../Planner/job_assigned'; // IMPORTED: New component
import JobModal from './JobModal';


interface PlannerJob {
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

interface PlannerSummary {
  totalJobs: number;
  poCompleted: number;
  machineDetailsCompleted: number;
  artworkCompleted: number;
  fullyCompleted: number;
  partiallyCompleted: number;
  notStarted: number;
   totalActiveJobs: number;
}

interface PlannerDashboardData {
  summary: PlannerSummary;
  allJobs: PlannerJob[];
}

interface PlannerDashboardProps {
  data: PlannerDashboardData;
}

const PlannerDashboard: React.FC<PlannerDashboardProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PlannerJob;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',      // Unified search for both customer name and NRC job no
    status: '',
    progress: ''
  });

  const [selectedJob, setSelectedJob] = useState<PlannerJob | null>(null);


 
  // Chart data preparation
  const chartData = useMemo(() => {
    // Pie chart data for completion status
    const completionData = [
      { name: 'Fully Completed', value: data.summary.fullyCompleted, color: '#10B981' },
      { name: 'Partially Completed', value: data.summary.partiallyCompleted, color: '#F59E0B' },
      { name: 'Not Started', value: data.summary.notStarted, color: '#EF4444' }
    ].filter(item => item.value > 0);

    // Bar chart data for completion comparison
    const comparisonData = [
      { name: 'PO', completed: data.summary.poCompleted, total: data.summary.totalJobs, color: '#3B82F6' },
      { name: 'Machine Details', completed: data.summary.machineDetailsCompleted, total: data.summary.totalJobs, color: '#8B5CF6' },
      { name: 'Artwork', completed: data.summary.artworkCompleted, total: data.summary.totalJobs, color: '#06B6D4' }
    ];

    return { completionData, comparisonData };
  }, [data.summary]);

   //console.log("processed jobs", data)

  // Apply filters and sorting
  const processedJobs = useMemo(() => {
    let filtered = data.allJobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.nrcJobNo.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || 
        job.status.toLowerCase().includes(filters.status.toLowerCase());
      const matchesProgress = !filters.progress || 
        (filters.progress === 'high' && job.overallProgress >= 80) ||
        (filters.progress === 'medium' && job.overallProgress >= 40 && job.overallProgress < 80) ||
        (filters.progress === 'low' && job.overallProgress < 40);
      
      return matchesSearch && matchesStatus && matchesProgress;
    });

    // First sort by updatedAt (most recent first) to get the 5 most recent jobs
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Limit to 5 most recent jobs
    const recentJobs = filtered.slice(0, 5);

    // Apply user sorting if specified
    if (sortConfig) {
      recentJobs.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return recentJobs;
  }, [data.allJobs, filters, sortConfig]);

 

  // Handle sorting
  const handleSort = (key: keyof PlannerJob) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Get sort indicator
  const getSortIndicator = (key: keyof PlannerJob) => {
    if (sortConfig?.key !== key) {
      return <ChartBarIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChartBarIcon className="h-4 w-4 text-blue-600" />
      : <ChartBarIcon className="h-4 w-4 text-blue-600" />;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    jobs: PlannerJob[];
  }>({
    isOpen: false,
    title: '',
    jobs: []
  });

  const openModal = (title: string, jobs: PlannerJob[]) => {
    setModalState({
      isOpen: true,
      title,
      jobs
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: '',
      jobs: []
    });
  };

  // Filter jobs based on their completion status
  const getJobsByStatus = (status: 'total' | 'completed' | 'partial' | 'notStarted') => {
    switch (status) {
      case 'total':
        return data.allJobs;
      case 'completed':
        return data.allJobs.filter(job => 
          job.poStatus === 'completed' && 
          job.artworkStatus === 'completed' && 
          job.machineDetailsStatus === 'completed'&&
          job.status !== "COMPLETED"
        );
      case 'partial':
        return data.allJobs.filter(job => {
          const completedSteps = [
            job.poStatus === 'completed',
            job.artworkStatus === 'completed', 
            job.machineDetailsStatus === 'completed'
          ].filter(Boolean).length;
          return completedSteps > 0 && completedSteps < 3;
        });
      case 'notStarted':
        return data.allJobs.filter(job => 
          job.poStatus === 'pending' && 
          job.artworkStatus === 'pending' && 
          job.machineDetailsStatus === 'pending'
        );
      default:
        return [];
    }
  };

   console.log("processed job", data)
  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className="bg-blue-500 p-3 rounded-xl">
            <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            
            <p className="text-gray-600 text-2xl">Job planning overview and progress tracking</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Jobs Card */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('All Jobs', getJobsByStatus('total'))}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Active Jobs </p>
              <p className="text-3xl font-bold text-blue-600">{data.summary.totalActiveJobs}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Fully Completed Card */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('Fully Completed Jobs', getJobsByStatus('completed'))}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fully Completed</p>
              <p className="text-3xl font-bold text-green-600">{data.summary.fullyCompleted}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Partially Completed Card */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('Partially Completed Jobs', getJobsByStatus('partial'))}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Partially Completed</p>
              <p className="text-3xl font-bold text-yellow-600">{data.summary.partiallyCompleted}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Not Started Card */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('Not Started Jobs', getJobsByStatus('notStarted'))}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not Started</p>
              <p className="text-3xl font-bold text-red-600">{data.summary.notStarted}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <JobModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        jobs={modalState.jobs}
      />

            {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by customer or NRC Job No..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
            <select
              value={filters.progress}
              onChange={(e) => setFilters(prev => ({ ...prev, progress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Progress</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (40-79%)</option>
              <option value="low">Low (0-39%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Job Card Details</h3>
          <p className="text-sm text-gray-600">Showing {processedJobs.length} of {data.allJobs.length} total jobs (filtered by most recent)</p>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'styleId', label: 'Style Id' },
                  { key: 'customerName', label: 'Customer Name' },
                  { key: 'poStatus', label: 'PO Status' },
                  { key: 'machineDetailsStatus', label: 'Machine Details' },
                  { key: 'artworkStatus', label: 'Artwork Status' },
                  { key: 'overallProgress', label: 'Overall Progress' },
                  { key: 'updatedAt', label: 'Last Updated' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key as keyof PlannerJob)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      {getSortIndicator(key as keyof PlannerJob)}
                    </div>
                  </th>
                  
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  View
</th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <DocumentTextIcon className="h-8 w-8 text-gray-300" />
                      <p>No jobs found matching the current filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processedJobs.map((job, index) => (
                  <tr key={`${job.nrcJobNo}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-mono">{job.styleItemSKU}</p>
                        {/* <p className="text-xs text-gray-500">{job.styleItemSKU}</p> */}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={job.customerName}>
                      {job.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.poStatus)}`}>
                        {job.poStatus === 'completed' ? '✅' : '⏳'} {job.poStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.machineDetailsStatus)}`}>
                        {job.machineDetailsStatus === 'completed' ? '✅' : '⏳'} {job.machineDetailsStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.artworkStatus)}`}>
                        {job.artworkStatus === 'completed' ? '✅' : '⏳'} {job.artworkStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(job.overallProgress)}`}
                            style={{ width: `${job.overallProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                          {job.overallProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.updatedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
  <button
    onClick={() => setSelectedJob(job)}
    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-900 font-medium"
  >
    <EyeIcon className="h-5 w-5" />
    <span>View</span>
  </button>
</td>


                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Pie Chart - Job Distribution by Completion Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Distribution by Completion Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {chartData.completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Completion Comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Progress</h3>
  <div className="space-y-6">
    {chartData.comparisonData.map((item, index) => {
      const completionRate = (item.completed / item.total) * 100;
      return (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">{item.name}</span>
            <span className="text-sm text-gray-600">
              {item.completed}/{item.total} ({Math.round(completionRate)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      );
    })}
  </div>
  
  {/* Overall summary */}
  <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900">
        {Math.round(
          (chartData.comparisonData.reduce((sum, item) => sum + item.completed, 0) /
           chartData.comparisonData.reduce((sum, item) => sum + item.total, 0)) * 100
        )}%
      </div>
      <div className="text-sm text-gray-600">Overall Completion Rate</div>
    </div>
  </div>
</div>

      </div>


      {selectedJob && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        onClick={() => setSelectedJob(null)}
      >
        ✕
      </button>

      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
        Job Details – <span className="font-mono">{selectedJob.nrcJobNo}</span>
      </h2>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Customer</p>
          <p className="font-medium text-gray-900">{selectedJob.customerName}</p>
        </div>

        <div>
          <p className="text-gray-500">Style SKU</p>
          <p className="font-mono text-gray-900">{selectedJob.styleItemSKU}</p>
        </div>

        <div>
          <p className="text-gray-500">PO Status</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedJob.poStatus)}`}>
            {selectedJob.poStatus}
          </span>
          <span className="ml-2 text-gray-600">({selectedJob.poCount} POs)</span>
        </div>

        <div>
          <p className="text-gray-500">Machine Details</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedJob.machineDetailsStatus)}`}>
            {selectedJob.machineDetailsStatus}
          </span>
        </div>

        <div>
          <p className="text-gray-500">Artwork</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedJob.artworkStatus)}`}>
            {selectedJob.artworkStatus}
          </span>
          <span className="ml-2 text-gray-600">({selectedJob.artworkCount} artworks)</span>
        </div>

        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-medium text-gray-900">{selectedJob.status}</p>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <p className="text-gray-500 mb-1">Overall Progress</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(selectedJob.overallProgress)}`}
                style={{ width: `${selectedJob.overallProgress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {selectedJob.overallProgress}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-gray-500">Last Updated</p>
          <p className="text-gray-900">{formatDate(selectedJob.updatedAt)}</p>
        </div>
      </div>
    </div>
  </div>
)}

 {/* <JobAssigned /> */}

    </div>
  );
};

export default PlannerDashboard; 