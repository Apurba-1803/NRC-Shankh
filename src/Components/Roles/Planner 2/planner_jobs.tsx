// src/Components/Roles/Planner/planner_jobs.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { type Job } from './Types/job.ts'; // Adjust path as needed
import JobCard from './jobCard/JobCard'; // Adjust path as needed
import JobDetailModal from './modal/jobDetailModal'; // Adjust path as needed
// JobInitiationForm is now rendered via a route, so no direct import needed here for rendering.

const PlannerJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null); // For the read-only detail modal
  const [message, setMessage] = useState<string | null>(null); // For success/error messages after any update
  const navigate = useNavigate(); // Initialize navigate

  // Helper function to check job completion status
  const checkJobCompletionStatus = (job: Job): 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' => {
    // 1. Check Artwork Details
    if (!job.artworkReceivedDate || !job.artworkApprovedDate || !job.shadeCardApprovalDate) {
      return 'artwork_pending';
    }

    // 2. Check P.O. Details
    if (!job.poNumber || !job.unit || !job.plant ||
        job.totalPOQuantity === null || job.dispatchQuantity === null ||
        job.pendingQuantity === null || job.noOfSheets === null ||
        !job.poDate || !job.deliveryDate || !job.dispatchDate || !job.nrcDeliveryDate) {
      return 'po_pending';
    }

    // 3. Check More Information
    if (!job.jobDemand || !job.machineId || !job.jobSteps || job.jobSteps.length === 0) {
      return 'more_info_pending';
    }

    return 'completed'; // All forms are filled
  };


  // Function to fetch all jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://nrc-backend-his4.onrender.com/api/jobs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const processedJobs: Job[] = data.data.map((j: any) => ({
          ...j,
          poNumber: j.poNumber || null,
          unit: j.unit || null,
          plant: j.plant || null,
          totalPOQuantity: j.totalPOQuantity || null,
          dispatchQuantity: j.dispatchQuantity || null,
          pendingQuantity: j.pendingQuantity || null,
          noOfSheets: j.noOfSheets || null,
          poDate: j.poDate || null,
          deliveryDate: j.deliveryDate || null,
          dispatchDate: j.dispatchDate || null,
          nrcDeliveryDate: j.nrcDeliveryDate || null,
          jobSteps: j.jobSteps || null,
          jobDemand: j.jobDemand || null,
          machineId: j.machineId || null,
        }));
        setJobs(processedJobs);
      } else {
        setError('Unexpected API response format or data is not an array.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Fetch Jobs Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Callback for when a job is updated through the JobInitiationForm (now comes from route)
  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(prevJobs =>
      prevJobs.map(job => (job.id === updatedJob.id ? updatedJob : job))
    );
    // No need to close modal here, as JobInitiationForm handles its own navigation back.
    setMessage(`Job ${updatedJob.nrcJobNo} updated successfully!`);
    setTimeout(() => setMessage(null), 3000);
  };

  // Function to handle updating job status (from JobDetailModal - "Continue with this job")
  const handleContinueJob = async (nrcJobNo: string) => {
    setMessage(null); // Clear previous update messages
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const API_ENDPOINT = `https://nrc-backend-his4.onrender.com/api/jobs/${nrcJobNo}`;
      const response = await fetch(API_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'ACTIVE' }), // Send the updated status
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update job status: ${response.status} ${response.statusText}`);
      }

      const updatedJobData = await response.json();
      if (updatedJobData.success) {
        setMessage(`Job ${nrcJobNo} successfully set to ACTIVE!`);
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.nrcJobNo === nrcJobNo ? { ...job, status: 'ACTIVE' } : job
          )
        );
        setSelectedJobForDetail(null); // Close the detail modal
      } else {
        setMessage(updatedJobData.message || `Failed to update job ${nrcJobNo}.`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`Error updating job: ${err.message}`);
      } else {
        setMessage('An unknown error occurred during job update.');
      }
      console.error('Update Job Error:', err);
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // New handler for clicking the "Fill details to start the job" button
  const handleInitiateJobClick = (job: Job) => {
    // Properly encode the job number for the URL
    const encodedJobNo = job.nrcJobNo;
    navigate(`/dashboard/planner/initiate-job/${encodedJobNo}`);
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const activeJobs = jobs.filter(job => job.status === 'ACTIVE');

  return (
    <div className="p-4 sm:p-6 lg:p-8  min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Active Jobs</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-600">Loading jobs...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded relative mb-6 ${message.includes('Error') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active jobs found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {activeJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={setSelectedJobForDetail}
                  onInitiateJobClick={handleInitiateJobClick} // Use the new navigation handler
                  jobCompletionStatus={checkJobCompletionStatus(job)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Job Detail Modal (read-only) */}
      {selectedJobForDetail && (
        <JobDetailModal
          job={selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          onContinueJob={handleContinueJob}
        />
      )}

      {/* Job Initiation Form is now rendered via a route, not directly here */}
    </div>
  );
};

export default PlannerJobs;
