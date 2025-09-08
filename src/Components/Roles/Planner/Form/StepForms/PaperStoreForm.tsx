// src/Components/Roles/Planner/PaperStoreForm.tsx
import React, { useState, useEffect } from 'react';
import { type JobPlanStep, type PaperStorePayload } from '../../Types/job.ts'; // Adjust path as needed

interface PaperStoreFormProps {
  jobPlanId: number;
  nrcJobNo: string;
  step: JobPlanStep;
  onCompleteWork: (payload: PaperStorePayload) => Promise<void>;
  onClose: () => void;
  isReadOnly: boolean; // To view completed/started details without editing
}

const PaperStoreForm: React.FC<PaperStoreFormProps> = ({ jobPlanId, nrcJobNo, step, onCompleteWork, onClose, isReadOnly }) => {
  // Helper to format date strings from ISO to YYYY-MM-DD for input type="date"
  const toDateInput = (isoDateString: string | null | undefined) => {
    if (!isoDateString) return '';
    try {
      return new Date(isoDateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    sheetSize: '',
    quantity: '',
    available: '',
    issuedDate: toDateInput(new Date().toISOString()), // Default to current date
    mill: '',
    extraMargin: '',
    gsm: '',
    quality: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you'd fetch existing paper store details here if editing an already started step
  // useEffect(() => {
  //   if (step.status === 'start' || step.status === 'stop') {
  //     // Fetch existing details for this step.id / jobStepId
  //     // e.g., GET /api/paper-store/{step.id}
  //     // setFormData with fetched data
  //   }
  // }, [step.id, step.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setError(null);
    setIsSubmitting(true);

    const requiredFields = ['sheetSize', 'quantity', 'available', 'issuedDate', 'mill', 'extraMargin', 'gsm', 'quality'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(', ')}.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: PaperStorePayload = {
        jobStepId: step.id,
        jobNrcJobNo: nrcJobNo,
        status: 'accept', // As per clarification
        sheetSize: formData.sheetSize,
        quantity: Number(formData.quantity),
        available: Number(formData.available),
        issuedDate: new Date(formData.issuedDate).toISOString(), // Convert date input to ISO string
        mill: formData.mill,
        extraMargin: formData.extraMargin,
        gsm: formData.gsm,
        quality: formData.quality,
      };
      await onCompleteWork(payload);
      onClose(); // Close modal after successful completion
    } catch (err) {
      setError(`Failed to complete work: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Paper Store</h2>
          <p className="text-gray-500 text-center mb-6">Details for Job: {nrcJobNo}, Step: {step.stepNo} - {step.stepName}</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

            {/* Display static job details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mb-4">
              <div><span className="font-medium">Job NRC Job No:</span> {nrcJobNo}</div>
              {/* Add other static details like Sheet Size, Required, GSM if available from jobPlan */}
              {/* For Required, you might need to fetch the main Job object */}
            </div>

            {/* Form Fields */}
            <div>
              <label htmlFor="sheetSize" className="block text-sm font-medium text-gray-700 mb-1">Sheet Size</label>
              <input type="text" id="sheetSize" name="sheetSize" value={formData.sheetSize} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="available" className="block text-sm font-medium text-gray-700 mb-1">Available</label>
              <input type="number" id="available" name="available" value={formData.available} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="issuedDate" className="block text-sm font-medium text-gray-700 mb-1">Issued Date</label>
              <input type="date" id="issuedDate" name="issuedDate" value={formData.issuedDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="mill" className="block text-sm font-medium text-gray-700 mb-1">Mill</label>
              <input type="text" id="mill" name="mill" value={formData.mill} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="extraMargin" className="block text-sm font-medium text-gray-700 mb-1">Extra Margin</label>
              <input type="text" id="extraMargin" name="extraMargin" value={formData.extraMargin} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="gsm" className="block text-sm font-medium text-gray-700 mb-1">GSM</label>
              <input type="text" id="gsm" name="gsm" value={formData.gsm} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <input type="text" id="quality" name="quality" value={formData.quality} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-green-600 transition hover:cursor-pointer shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isReadOnly}
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
              {isSubmitting ? 'Completing...' : 'Complete Work'}
            </button>
            <button
              type="button"
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-base hover:bg-gray-300 transition hover:cursor-pointer shadow-md mt-2"
              onClick={onClose}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaperStoreForm;
