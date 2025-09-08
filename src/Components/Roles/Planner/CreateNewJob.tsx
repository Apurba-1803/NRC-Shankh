import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

interface CreateNewJobFormData {
  nrcJobNo: string | null;
  styleItemSKU: string;
  customerName: string;
  fluteType: string;
  status: string;
  latestRate: number | null;
  preRate: number;
  length: number;
  width: number;
  height: number;
  boxDimensions: string;
  diePunchCode: number;
  boardCategory: string | null;
  noOfColor: string;
  processColors: string | null;
  specialColor1: string | null;
  specialColor2: string | null;
  specialColor3: string | null;
  specialColor4: string | null;
  overPrintFinishing: string | null;
  topFaceGSM: string;
  flutingGSM: string;
  bottomLinerGSM: string;
  decalBoardX: string;
  lengthBoardY: string;
  boardSize: string;
  noUps: number | null;
  artworkReceivedDate: string | null;
  artworkApprovedDate: string | null;
  shadeCardApprovalDate: string | null;
  srNo: number;
}

interface CreateNewJobProps {
  onBack: () => void;
}

const CreateNewJob: React.FC<CreateNewJobProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateNewJobFormData>({
    nrcJobNo: '',
    styleItemSKU: '',
    customerName: '',
    fluteType: '5PLY', // Set default value
    status: 'ACTIVE', // Changed to uppercase enum value
    latestRate: null,
    preRate: 0,
    length: 0,
    width: 0,
    height: 0,
    boxDimensions: '',
    diePunchCode: 0,
    boardCategory: '',
    noOfColor: '',
    processColors: '',
    specialColor1: '',
    specialColor2: '',
    specialColor3: '',
    specialColor4: '',
    overPrintFinishing: '',
    topFaceGSM: '',
    flutingGSM: '',
    bottomLinerGSM: '',
    decalBoardX: '',
    lengthBoardY: '',
    boardSize: '',
    noUps: null,
    artworkReceivedDate: '', // Use empty string for date inputs
    artworkApprovedDate: '', // Use empty string for date inputs
    shadeCardApprovalDate: '', // Use empty string for date inputs
    srNo: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : parseFloat(value)
      }));
    } else if (type === 'date') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.styleItemSKU || !formData.customerName || !formData.fluteType || !formData.noOfColor) {
        throw new Error('Please fill in all required fields: Style Item SKU, Customer Name, Flute Type, and Number of Colors');
      }

      // Validate dimensions
      if (formData.length <= 0 || formData.width <= 0 || formData.height <= 0) {
        throw new Error('Please enter valid dimensions (Length, Width, and Height must be greater than 0)');
      }

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // Prepare the data with proper type conversions to match endpoint format
      // Exclude database-generated fields like 'id' - let the database handle them
      const submitData = {
        // Basic fields
        nrcJobNo: formData.nrcJobNo || null,
        styleItemSKU: formData.styleItemSKU,
        customerName: formData.customerName,
        fluteType: formData.fluteType,
        status: formData.status,
        latestRate: formData.latestRate || null,
        preRate: Number(formData.preRate),
        
        // Dimension fields
        length: Number(formData.length),
        width: Number(formData.width),
        height: String(formData.height),
        boxDimensions: formData.boxDimensions,
        
        // Technical fields
        diePunchCode: Number(formData.diePunchCode),
        boardCategory: formData.boardCategory || null,
        noOfColor: formData.noOfColor,
        processColors: formData.processColors || null,
        
        // Special colors
        specialColor1: formData.specialColor1 || null,
        specialColor2: formData.specialColor2 || null,
        specialColor3: formData.specialColor3 || null,
        specialColor4: formData.specialColor4 || null,
        
        // Finishing and materials
        overPrintFinishing: formData.overPrintFinishing || null,
        topFaceGSM: formData.topFaceGSM,
        flutingGSM: formData.flutingGSM,
        bottomLinerGSM: formData.bottomLinerGSM,
        
        // Board details
        decalBoardX: formData.decalBoardX || null,
        lengthBoardY: formData.lengthBoardY || null,
        boardSize: formData.boardSize,
        noUps: formData.noUps || null,
        
        // Dates
        artworkReceivedDate: formData.artworkReceivedDate ? new Date(formData.artworkReceivedDate).toISOString() : null,
        artworkApprovedDate: formData.artworkApprovedDate ? new Date(formData.artworkApprovedDate).toISOString() : null,
        shadeCardApprovalDate: formData.shadeCardApprovalDate ? new Date(formData.shadeCardApprovalDate).toISOString() : null,
        
        // Reference number
        srNo: Number(formData.srNo),
      };

      console.log('Submitting data to API:', submitData);

      const response = await fetch('https://nrprod.nrcontainers.com/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          requestData: submitData
        });
        throw new Error(errorData.error || `Failed to create job: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      setMessage({ type: 'success', text: 'Job created successfully!' });
      
      // Reset form after successful creation
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create job' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create New Job</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NRC Job Number</label>
                <input
                  type="text"
                  name="nrcJobNo"
                  value={formData.nrcJobNo || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NRC001, NRC002"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style Item SKU</label>
                <input
                  type="text"
                  name="styleItemSKU"
                  value={formData.styleItemSKU}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8KGC.TBOXMASTERCARTON"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SAKATASEEDS, Company Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flute Type</label>
                <select
                  name="fluteType"
                  value={formData.fluteType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="5PLY">5PLY</option>
                  <option value="3PLY">3PLY</option>
                  <option value="7PLY">7PLY</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pre Rate</label>
                <input
                  type="number"
                  name="preRate"
                  value={formData.preRate}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 79.76, 100.50"
                  required
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Box Dimensions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length (mm)</label>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 460.0, 500.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (mm)</label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 350.0, 400.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (mm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 310.0, 350.0"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Box Dimensions (LxWxH)</label>
                <input
                  type="text"
                  name="boxDimensions"
                  value={formData.boxDimensions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 460x350x310, 500x400x350"
                  required
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Die Punch Code</label>
                  <input
                    type="number"
                    name="diePunchCode"
                    value={formData.diePunchCode}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1.0, 2.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Colors</label>
                  <input
                    type="text"
                    name="noOfColor"
                    value={formData.noOfColor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4, 6, 8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Top Face GSM</label>
                  <input
                    type="text"
                    name="topFaceGSM"
                    value={formData.topFaceGSM}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 300, 350, 400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fluting GSM</label>
                  <textarea
                    name="flutingGSM"
                    value={formData.flutingGSM}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 120&#10;120, 150&#10;150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Liner GSM</label>
                  <textarea
                    name="bottomLinerGSM"
                    value={formData.bottomLinerGSM}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 120&#10;120, 150&#10;150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board Size</label>
                  <input
                    type="text"
                    name="boardSize"
                    value={formData.boardSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 70x86, 80x90"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Special Colors */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Color 1</label>
                  <input
                    type="text"
                    name="specialColor1"
                    value={formData.specialColor1 || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pantone 123C, Metallic Gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Color 2</label>
                  <input
                    type="text"
                    name="specialColor2"
                    value={formData.specialColor2 || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pantone 456C, UV Blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Color 3</label>
                  <input
                    type="text"
                    name="specialColor3"
                    value={formData.specialColor3 || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pantone 789C, Fluorescent Pink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Color 4</label>
                  <input
                    type="text"
                    name="specialColor4"
                    value={formData.specialColor4 || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pantone 012C, Silver Foil"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Artwork Received Date</label>
                  <input
                    type="date"
                    name="artworkReceivedDate"
                    value={formData.artworkReceivedDate ? formData.artworkReceivedDate.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Artwork Approved Date</label>
                  <input
                    type="date"
                    name="artworkApprovedDate"
                    value={formData.artworkApprovedDate ? formData.artworkApprovedDate.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shade Card Approval Date</label>
                  <input
                    type="date"
                    name="shadeCardApprovalDate"
                    value={formData.shadeCardApprovalDate ? formData.shadeCardApprovalDate.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SR Number</label>
                  <input
                    type="number"
                    name="srNo"
                    value={formData.srNo}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 196.0, 200.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Over Print Finishing</label>
                  <input
                    type="text"
                    name="overPrintFinishing"
                    value={formData.overPrintFinishing || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Varnish, Lamination, Foil Stamping"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00AEEF] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Job...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Create Job</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewJob; 