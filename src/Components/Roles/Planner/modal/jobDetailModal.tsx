// src/Components/Roles/Planner/JobDetailModal.tsx
import React from 'react';
import {type Job } from '../Types/job.ts';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onContinueJob: (nrcJobNo: string) => Promise<void>; // New prop for continuing the job
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onContinueJob }) => {
  const [isUpdating, setIsUpdating] = React.useState(false); // State to manage button loading

  // Helper to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderField = (label: string, value: string | number | null) => (
    <div className="flex flex-col mb-3">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <p className="text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-200">
        {value !== null && value !== '' ? value : 'N/A'}
      </p>
    </div>
  );

  const handleContinueClick = async () => {
    setIsUpdating(true);
    try {
      await onContinueJob(job.nrcJobNo);
      onClose(); // Close modal after successful update
    } catch (error) {
      // Error handling will be done in StartNewJob, but you could show a local message here too
      console.error("Failed to continue job from modal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    // Outer overlay for modal: fixed, centered, with dark background, blur.
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      {/* Modal content container */}
      <div className="relative w-full max-w-2xl mx-2 sm:mx-auto bg-white rounded-2xl shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        {/* Inner content wrapper with specific padding and now HAS THE SCROLL */}
        <div className="w-full max-w-2xl px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          {/* Modal Header */}
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Job Details: {job.nrcJobNo}</h2>
          <p className="text-gray-500 text-center mb-6">Detailed information for this job order.</p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
            {renderField('Customer Name', job.customerName)}
            {renderField('Style Item SKU', job.styleItemSKU)}
            {renderField('NRC Job No', job.nrcJobNo)}
            {renderField('Flute Type', job.fluteType)}
            {renderField('Status', job.status)}
            {renderField('Latest Rate', job.latestRate)}
            {renderField('Pre Rate', job.preRate)}
            {renderField('Length', job.length)}
            {renderField('Width', job.width)}
            {renderField('Height', job.height)}
            {renderField('Box Dimensions', job.boxDimensions)}
            {renderField('Die Punch Code', job.diePunchCode)}
            {renderField('Board Category', job.boardCategory)}
            {renderField('Number of Colors', job.noOfColor)}
            {renderField('Process Colors', job.processColors)}
            {renderField('Special Color 1', job.specialColor1)}
            {renderField('Special Color 2', job.specialColor2)}
            {renderField('Special Color 3', job.specialColor3)}
            {renderField('Special Color 4', job.specialColor4)}
            {renderField('Over Print Finishing', job.overPrintFinishing)}
            {renderField('Top Face GSM', job.topFaceGSM)}
            {renderField('Fluting GSM', job.flutingGSM)}
            {renderField('Bottom Liner GSM', job.bottomLinerGSM)}
            {renderField('Decal Board X', job.decalBoardX)}
            {renderField('Length Board Y', job.lengthBoardY)}
            {renderField('Board Size', job.boardSize)}
            {renderField('No Ups', job.noUps)}
            {renderField('Artwork Received Date', formatDate(job.artworkReceivedDate))}
            {renderField('Artwork Approved Date', formatDate(job.artworkApprovedDate))}
            {renderField('Shade Card Approval Date', formatDate(job.shadeCardApprovalDate))}
            {renderField('SR No', job.srNo)}
            {renderField('Job Demand', job.jobDemand)}
            {renderField('Created At', formatDate(job.createdAt))}
            {renderField('Updated At', formatDate(job.updatedAt))}
          </div>

          {job.imageURL && (
            <div className="mt-6 w-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Artwork Image</h3>
              <img
                src={job.imageURL}
                alt="Artwork"
                className="w-full h-auto max-h-64 object-contain rounded-md border border-gray-200"
                onError={(e) => {
                  e.currentTarget.onerror = null; // prevents looping
                  e.currentTarget.src = `https://placehold.co/150x150/cccccc/000000?text=No+Image`;
                }}
              />
            </div>
          )}

          {/* Conditional Button based on Job Status */}
          <div className="w-full mt-8">
            {job.status === 'ACTIVE' ? (
              <button
                className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md"
                disabled // Disable if it's just a status indicator
              >
                This Job is Active
              </button>
            ) : (
              <button
                className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md"
                onClick={handleContinueClick} // Call the new handler
                disabled={isUpdating} // Disable button while updating
              >
                {isUpdating ? 'Updating Status...' : 'Continue with this job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
