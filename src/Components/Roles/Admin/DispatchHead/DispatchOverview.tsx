import React, { useEffect, useState } from 'react';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { dispatchService, type DispatchProcess, type DispatchData } from './dispatchService';
import LoadingSpinner from '../../../common/LoadingSpinner';

const DispatchOverview: React.FC = () => {
  const [dispatchData, setDispatchData] = useState<DispatchProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchProcess | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showAllData, setShowAllData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await dispatchService.getAllDispatchProcesses();
        setDispatchData(data);
      } catch (error) {
        console.error('Error loading dispatch data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate summary data
  const summaryData: DispatchData = {
    totalDispatches: dispatchData.length,
    totalQuantityDispatched: dispatchData.reduce((sum, item) => sum + item.quantity, 0),
    totalBalanceQuantity: dispatchData.reduce((sum, item) => sum + item.balanceQty, 0),
    completedDispatches: dispatchData.filter(item => item.status === 'accept').length,
    pendingDispatches: dispatchData.filter(item => item.status === 'pending').length,
    rejectedDispatches: dispatchData.filter(item => item.status === 'rejected').length,
  };

  // Filter data based on search and status
  const filteredData = dispatchData.filter(item => {
    const matchesSearch = 
      item.jobNrcJobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dispatchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by dispatch date (latest first) and limit to 5 items
  const sortedData = filteredData
    .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
  
  // Show all data or limit to 5 based on state
  const displayData = showAllData ? sortedData : sortedData.slice(0, 5);

  // Get status color and label
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'accept':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Accepted', icon: CheckCircleIcon };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: ClockIcon };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected', icon: ExclamationTriangleIcon };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown', icon: ExclamationTriangleIcon };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle row click to show details
  const handleRowClick = (dispatch: DispatchProcess) => {
    setSelectedDispatch(dispatch);
    setShowDetailPanel(true);
  };

  // Close detail panel
  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedDispatch(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Dispatch Dashboard..." />
      </div>
    );
  }

  // Show message when no data is available
  if (dispatchData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="bg-blue-500 p-3 rounded-xl">
              <TruckIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dispatch Head Dashboard</h1>
              <p className="text-gray-600 text-lg">Monitor and manage all dispatch operations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dispatch Data Available</h3>
          <p className="text-gray-600 mb-4">No dispatch processes found in the system.</p>
          <button
            onClick={() => {
              setLoading(true);
              dispatchService.getAllDispatchProcesses().then(setDispatchData).finally(() => setLoading(false));
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screenp-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <TruckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
             
              <p className="text-gray-600 text-lg">Monitor and manage all dispatch operations</p>
            </div>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              dispatchService.getAllDispatchProcesses().then(setDispatchData).finally(() => setLoading(false));
            }}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" variant="button" color="white" text="Refreshing..." />
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </button>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dispatches</p>
              <p className="text-xl font-bold text-blue-600">{summaryData.totalDispatches}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <TruckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quantity Dispatched</p>
              <p className="text-l font-bold text-green-600">{summaryData.totalQuantityDispatched.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance Qty</p>
              <p className="text-xl font-bold text-orange-600">{summaryData.totalBalanceQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <ClockIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">{summaryData.completedDispatches}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{summaryData.pendingDispatches}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-red-600">{summaryData.rejectedDispatches}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Job No, Dispatch No, or Operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="accept">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {displayData.length} of {filteredData.length} dispatches ({showAllData ? 'all' : 'latest 5'} by dispatch date)
          </div>
        </div>
      </div>

      {/* Dispatch Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Dispatch Details</h3>
          <p className="text-sm text-gray-600">Click on any row to view detailed information</p>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispatch Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Qty</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <TruckIcon className="h-8 w-8 text-gray-300" />
                      <p>No dispatches found matching the current filters</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((dispatch: DispatchProcess) => {
                  const statusInfo = getStatusInfo(dispatch.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr 
                      key={dispatch.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(dispatch)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">{dispatch.dispatchNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{dispatch.jobNrcJobNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {dispatch.jobNrcJobNo.split('–')[1]?.trim() || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(dispatch.dispatchDate)}
                      </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-center">
                       <div className="text-sm font-medium text-gray-900">{dispatch.quantity.toLocaleString()}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                       <div className="flex flex-col items-center space-y-1">
                         <div className="text-sm font-medium text-gray-900">{dispatch.balanceQty.toLocaleString()}</div>
                         <div className="w-20 bg-gray-200 rounded-full h-2">
                           <div 
                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                             style={{ width: `${((dispatch.quantity - dispatch.balanceQty) / dispatch.quantity) * 100}%` }}
                           ></div>
                         </div>
                         <div className="text-xs text-gray-500">
                           {Math.round(((dispatch.quantity - dispatch.balanceQty) / dispatch.quantity) * 100)}%
                         </div>
                       </div>
                     </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dispatch.operatorName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Show View All button when there are more than 5 items */}
        {filteredData.length > 5 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {showAllData 
                  ? `Showing all ${displayData.length} dispatches` 
                  : `Showing latest 5 of ${filteredData.length} dispatches`
                }
              </p>
              <button
                onClick={() => setShowAllData(!showAllData)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                {showAllData ? 'Show Latest 5' : `View All (${filteredData.length})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Side Panel */}
      {showDetailPanel && selectedDispatch && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Dispatch Details</h3>
                <button
                  onClick={closeDetailPanel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Dispatch Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dispatch No:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedDispatch.dispatchNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Job No:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono">{selectedDispatch.jobNrcJobNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedDispatch.status).color}`}>
                        {getStatusInfo(selectedDispatch.status).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Quantity Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedDispatch.quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Balance Qty:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedDispatch.balanceQty.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((selectedDispatch.quantity - selectedDispatch.balanceQty) / selectedDispatch.quantity) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {selectedDispatch.quantity - selectedDispatch.balanceQty} of {selectedDispatch.quantity} dispatched
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Operational Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Operator:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedDispatch.operatorName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shift:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedDispatch.shift || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">QC Check By:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedDispatch.qcCheckSignBy || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedDispatch.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dispatch Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedDispatch.dispatchDate)}</span>
                    </div>
                  </div>
                </div>

                {selectedDispatch.remarks && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Remarks</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{selectedDispatch.remarks}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchOverview;
