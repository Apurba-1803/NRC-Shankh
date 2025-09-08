import React, { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { qcService, type QCData, type QCSummary } from './qcService';
import LoadingSpinner from '../../../common/LoadingSpinner';

const QCDashboard: React.FC = () => {
  const [qcData, setQcData] = useState<QCData[]>([]);
  const [summaryData, setSummaryData] = useState<QCSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQC, setSelectedQC] = useState<QCData | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showAllData, setShowAllData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [data, summary] = await Promise.all([
          qcService.getAllQCData(),
          qcService.getQCStatistics()
        ]);
        setQcData(data);
        setSummaryData(summary);
      } catch (error) {
        console.error('Error loading QC data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter data based on search and status
  const filteredData = qcData.filter(item => {
    const matchesSearch = 
      item.jobNrcJobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.checkedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by date (latest first) and limit to 5 items
  const sortedData = filteredData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
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
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected', icon: XCircleIcon };
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
  const handleRowClick = (qc: QCData) => {
    setSelectedQC(qc);
    setShowDetailPanel(true);
  };

  // Close detail panel
  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedQC(null);
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [data, summary] = await Promise.all([
        qcService.getAllQCData(),
        qcService.getQCStatistics()
      ]);
      setQcData(data);
      setSummaryData(summary);
    } catch (error) {
      console.error('Error refreshing QC data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading QC Dashboard..." />
      </div>
    );
  }

  // Show message when no data is available
  if (qcData.length === 0) {
    return (
      <div className="min-h-screen  p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="bg-blue-500 p-3 rounded-xl">
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              
              <p className="text-gray-600 text-lg">Monitor and manage quality control operations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No QC Data Available</h3>
          <p className="text-gray-600 mb-4">No quality control checks found in the system.</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <ClipboardDocumentCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
             
              <p className="text-gray-600 text-lg">Monitor and manage quality control operations</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total QC Checks</p>
              <p className="text-xl font-bold text-blue-600">{summaryData?.totalQCChecks || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <ClipboardDocumentCheckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quantity Checked</p>
              <p className="text-xl font-bold text-indigo-600">{(summaryData?.totalQuantityChecked || 0).toLocaleString()}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-xl">
              <ClipboardDocumentCheckIcon className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted Qty</p>
              <p className="text-xl font-bold text-green-600">{(summaryData?.totalAcceptedQuantity || 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected Qty</p>
              <p className="text-xl font-bold text-red-600">{(summaryData?.totalRejectedQuantity || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejection %</p>
              <p className="text-xl font-bold text-orange-600">{summaryData?.rejectionPercentage || 0}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Reason</p>
              <p className="text-lg font-bold text-gray-900 truncate">{summaryData?.topRejectionReason || 'N/A'}</p>
              <p className="text-sm text-gray-500">{(summaryData?.topRejectionCount || 0).toLocaleString()} qty</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Checks</p>
              <p className="text-xl font-bold text-yellow-600">{qcData.filter(item => item.status === 'pending').length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
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
                placeholder="Search by Job No, Operator, or Checked By..."
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
            Showing {displayData.length} of {filteredData.length} QC checks ({showAllData ? 'all' : 'latest 5'} by date)
          </div>
        </div>
      </div>

      {/* QC Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">QC Details</h3>
          <p className="text-sm text-gray-600">Click on any row to view detailed information</p>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QC Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected Qty</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection %</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <ClipboardDocumentCheckIcon className="h-8 w-8 text-gray-300" />
                      <p>No QC checks found matching the current filters</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((qc) => {
                  const statusInfo = getStatusInfo(qc.status);
                  const StatusIcon = statusInfo.icon;
                  const rejectionPercentage = qc.quantity > 0 ? (qc.rejectedQty / qc.quantity) * 100 : 0;
                  
                  return (
                    <tr 
                      key={qc.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(qc)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">{qc.jobNrcJobNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(qc.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qc.checkedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qc.operatorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">{qc.quantity.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">{qc.rejectedQty.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="text-sm font-medium text-gray-900">{rejectionPercentage.toFixed(1)}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(rejectionPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusInfo.label}
                        </span>
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
                  ? `Showing all ${displayData.length} QC checks` 
                  : `Showing latest 5 of ${filteredData.length} QC checks`
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
      {showDetailPanel && selectedQC && (
        <div className="fixed inset-0  bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">QC Details</h3>
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
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Job Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Job No:</span>
                      <span className="text-sm font-medium text-gray-900 font-mono">{selectedQC.jobNrcJobNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedQC.status).color}`}>
                        {getStatusInfo(selectedQC.status).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Quantity Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Quantity:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rejected Quantity:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.rejectedQty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Accepted Quantity:</span>
                      <span className="text-sm font-medium text-gray-900">{(selectedQC.quantity - selectedQC.rejectedQty).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(selectedQC.rejectedQty / selectedQC.quantity) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {((selectedQC.rejectedQty / selectedQC.quantity) * 100).toFixed(1)}% rejected
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">QC Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Checked By:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.checkedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Operator:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.operatorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shift:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.shift || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">QC Sign By:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.qcCheckSignBy || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Rejection Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reason:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedQC.reasonForRejection}</span>
                    </div>
                    {selectedQC.remarks && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Remarks:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedQC.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Timeline</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">QC Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedQC.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QCDashboard; 