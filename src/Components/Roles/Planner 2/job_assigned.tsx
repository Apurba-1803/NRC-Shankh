// src/Components/Roles/Planner/job_assigned.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { type JobPlan } from './Types/job.ts'; // Adjust path as needed
import JobPlanningCard from './jobPlanningCard/JobPlanningCard.tsx'; // Import the new card component
import JobPlanningDetailModal from './modal/JobPlanningDetailModal.tsx'; // Import the new detail modal

const JobAssigned: React.FC = () => {
  const [jobPlans, setJobPlans] = useState<JobPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobPlan, setSelectedJobPlan] = useState<JobPlan | null>(null); // For detail modal
  const navigate = useNavigate(); // Initialize navigate

  // Function to fetch all job plans
  const fetchJobPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://nrc-backend-his4.onrender.com/api/job-planning/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch job plans: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setJobPlans(data.data);
      } else {
        setError('Unexpected API response format or data is not an array.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Fetch Job Plans Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobPlans();
    }, 50); // Small delay to ensure localStorage is ready

    return () => clearTimeout(timer);
  }, []);

  // Handler for clicking the JobPlanningCard itself
  const handleCardClick = (jobPlan: JobPlan) => {
    navigate(`/dashboard/planner/job-steps/${jobPlan.jobPlanId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8  min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Assigned Job Plans</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-600">Loading job plans...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {jobPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No job plans found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {jobPlans.map(jobPlan => (
                <JobPlanningCard
                  key={jobPlan.jobPlanId}
                  jobPlan={jobPlan}
                  onClick={() => setSelectedJobPlan(jobPlan)} // Button click opens detail modal
                  onCardClick={handleCardClick} // New prop for card click navigation
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedJobPlan && (
        <JobPlanningDetailModal
          jobPlan={selectedJobPlan}
          onClose={() => setSelectedJobPlan(null)}
        />
      )}
    </div>
  );
};

export default JobAssigned;
