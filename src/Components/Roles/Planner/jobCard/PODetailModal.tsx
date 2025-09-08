import React from 'react';
import { X, Calendar, Package, User, Building, Hash, Ruler } from 'lucide-react';

interface PurchaseOrder {
  id: number;
  boardSize: string | null;
  customer: string;
  deliveryDate: string;
  dieCode: number | null;
  dispatchDate: string | null;
  dispatchQuantity: number | null;
  fluteType: string | null;
  jockeyMonth: string | null;
  noOfUps: number | null;
  nrcDeliveryDate: string | null;
  noOfSheets: number | null;
  poDate: string;
  poNumber: string;
  pendingQuantity: number | null;
  pendingValidity: number | null;
  plant: string | null;
  shadeCardApprovalDate: string | null;
  sharedCardDiffDate: number | null;
  srNo: number | null;
  style: string | null;
  totalPOQuantity: number | null;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobNrcJobNo: string | null;
  userId: string | null;
  job: {
    nrcJobNo: string;
    customerName: string;
    styleItemSKU: string;
  } | null;
  user: any | null;
}

interface PODetailModalProps {
  po: PurchaseOrder | null;
  onClose: () => void;
}

const PODetailModal: React.FC<PODetailModalProps> = ({ po, onClose }) => {
  if (!po) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB');
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200 gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Purchase Order Details</h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">PO Number: {po.poNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors self-end sm:self-auto"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">PO Number:</span>
                    <span className="text-xs sm:text-sm text-gray-800 break-all">{po.poNumber}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      po.status === 'created' ? 'bg-blue-100 text-blue-800' :
                      po.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      po.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Style:</span>
                    <span className="text-xs sm:text-sm text-gray-800 break-all">{po.style || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Unit:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.unit}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                  Customer Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Customer:</span>
                    <span className="text-xs sm:text-sm text-gray-800 break-all">{po.customer}</span>
                  </div>
                  {po.job && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Job Number:</span>
                        <span className="text-xs sm:text-sm text-gray-800 break-all">{po.job.nrcJobNo}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Style SKU:</span>
                        <span className="text-xs sm:text-sm text-gray-800 break-all">{po.job.styleItemSKU}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                  Important Dates
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">PO Date:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDate(po.poDate)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Delivery Date:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDate(po.deliveryDate)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Dispatch Date:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDate(po.dispatchDate || '')}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">NRC Delivery:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDate(po.nrcDeliveryDate || '')}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Shade Card Approval:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDate(po.shadeCardApprovalDate || '')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Specifications */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Ruler className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
                  Specifications
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Board Size:</span>
                    <span className="text-xs sm:text-sm text-gray-800 break-all">{po.boardSize || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Flute Type:</span>
                    <span className="text-xs sm:text-sm text-gray-800 break-all">{po.fluteType || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Die Code:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.dieCode || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">No. of Ups:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.noOfUps || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Jockey Month:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.jockeyMonth || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Quantities */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Hash className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600" />
                  Quantities
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Total PO Quantity:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.totalPOQuantity || 0}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">No. of Sheets:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.noOfSheets || 0}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Dispatch Quantity:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.dispatchQuantity || 0}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Pending Quantity:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.pendingQuantity || 0}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Pending Validity:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.pendingValidity || 0} days</span>
                  </div>
                </div>
              </div>

              {/* Plant & System Info */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" />
                  Plant & System
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Plant:</span>
                    <span className="text-xs sm:text-sm text-gray-800 break-all">{po.plant || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">SR No:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.srNo || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Shared Card Diff:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{po.sharedCardDiffDate || 0} days</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Created:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDateTime(po.createdAt)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Updated:</span>
                    <span className="text-xs sm:text-sm text-gray-800">{formatDateTime(po.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PODetailModal; 