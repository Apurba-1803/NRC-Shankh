// src/Components/Roles/Planner/ArtworkDetailsForm.tsx
import React, { useState } from 'react';
import { type Job } from '../Types/job.ts'; // Adjust path as needed

interface ArtworkDetailsFormProps {
  job: Job;
  onSave: (updatedJob: Partial<Job>) => Promise<void>;
  onClose: () => void;
  onNext: () => void;
  isReadOnly: boolean;
}

const ArtworkDetailsForm: React.FC<ArtworkDetailsFormProps> = ({ job, onSave, onClose, onNext, isReadOnly }) => {
  const [artworkReceivedDate, setArtworkReceivedDate] = useState<string>(job.artworkReceivedDate ? job.artworkReceivedDate.split('T')[0] : '');
  const [artworkApprovedDate, setArtworkApprovedDate] = useState<string>(job.artworkApprovedDate ? job.artworkApprovedDate.split('T')[0] : '');
  const [shadeCardApprovalDate, setShadeCardApprovalDate] = useState<string>(job.shadeCardApprovalDate ? job.shadeCardApprovalDate.split('T')[0] : '');

  // Initialize artworkImage. If job.imageURL is a known placeholder that causes resolution issues, treat it as null.
  const initialArtworkImage = (job.imageURL && !job.jobDemand?.includes('via.placeholder.com')) ? job.imageURL : null; // Changed job.imageURL.includes to job.jobDemand?.includes
  const [artworkImage, setArtworkImage] = useState<string | null>(initialArtworkImage); // Stores Base64 or URL

  const [imageFile, setImageFile] = useState<File | null>(null); // Stores the actual file object
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;

    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heif', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Unsupported image format. Please use JPEG, JPG, PNG, AVIF, WEBP, or HEIF.');
        setImageFile(null);
        setArtworkImage(null);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtworkImage(reader.result as string); // Store Base64 string
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setArtworkImage(null);
      };
      reader.readAsDataURL(file); // Read file as Base64
    } else {
      setImageFile(null);
      setArtworkImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setError(null);
    setIsSubmitting(true);

    if (!artworkReceivedDate || !artworkApprovedDate || !shadeCardApprovalDate) {
      setError('All artwork date fields are required.');
      setIsSubmitting(false);
      return;
    }

    // Convert YYYY-MM-DD to ISO 8601 UTC string
    const toISOString = (dateString: string) => {
      if (!dateString) return null;
      // Append 'T00:00:00.000Z' to ensure it's treated as UTC start of day
      return new Date(dateString + 'T00:00:00.000Z').toISOString();
    };

    try {
      const updatedFields: Partial<Job> = {
        artworkReceivedDate: toISOString(artworkReceivedDate),
        artworkApprovedDate: toISOString(artworkApprovedDate),
        shadeCardApprovalDate: toISOString(shadeCardApprovalDate),
        imageURL: artworkImage, // Pass Base64 string directly as imageURL
      };
      await onSave(updatedFields);
      onNext();
    } catch (err) {
      setError(`Failed to save artwork details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Artwork Details</h2>
        <p className="text-gray-500 text-center mb-6">Please fill in the artwork related dates and image for Job: {job.nrcJobNo}</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

          <div>
            <label htmlFor="artworkReceivedDate" className="block text-sm font-medium text-gray-700 mb-1">Artwork Received Date</label>
            <input
              type="date"
              id="artworkReceivedDate"
              value={artworkReceivedDate}
              onChange={(e) => setArtworkReceivedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="artworkApprovedDate" className="block text-sm font-medium text-gray-700 mb-1">Artwork Approval Date</label>
            <input
              type="date"
              id="artworkApprovedDate"
              value={artworkApprovedDate}
              onChange={(e) => setArtworkApprovedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="shadeCardApprovalDate" className="block text-sm font-medium text-gray-700 mb-1">Shade Card Approval Date</label>
            <input
              type="date"
              id="shadeCardApprovalDate"
              value={shadeCardApprovalDate}
              onChange={(e) => setShadeCardApprovalDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={isReadOnly}
            />
          </div>

          {/* Artwork Image Upload */}
          <div>
            <label htmlFor="artworkImage" className="block text-sm font-medium text-gray-700 mb-1">Artwork Image</label>
            <input
              type="file"
              id="artworkImage"
              accept=".jpeg,.jpg,.png,.avif,.webp,.heif"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isReadOnly}
            />
            {artworkImage && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                {/* Conditional rendering for image source to prevent error if URL is invalid */}
                {/* Now also checks if the URL is a known problematic placeholder */}
                {artworkImage.startsWith('data:') || (artworkImage.startsWith('http') && !artworkImage.includes('via.placeholder.com')) ? (
                  <img
                    src={artworkImage}
                    alt="Artwork Preview"
                    className="max-w-full h-auto max-h-48 rounded-md border border-gray-200 object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = `https://placehold.co/150x150/cccccc/000000?text=Image+Error`; // Fallback image for broken URLs
                    }}
                  />
                ) : (
                  <p className="text-red-500 text-sm">Invalid image format or URL.</p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isReadOnly}
          >
            {isSubmitting && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {isSubmitting ? 'Saving...' : 'Save & Next'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ArtworkDetailsForm;
