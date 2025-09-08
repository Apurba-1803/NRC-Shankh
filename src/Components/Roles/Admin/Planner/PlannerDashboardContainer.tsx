import React, { useState, useEffect } from 'react';
import { plannerService } from './plannerService';
import type { PlannerDashboardData } from './plannerService';
import PlannerDashboard from './PlannerDashboard';
import LoadingSpinner from '../../../common/LoadingSpinner';

const PlannerDashboardContainer: React.FC = () => {
  const [data, setData] = useState<PlannerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const dashboardData = await plannerService.getPlannerDashboard();
        setData(dashboardData);
      } catch (error) {
        console.error('Error fetching planner dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log("data in conatainer", data)

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dashboardData = await plannerService.getPlannerDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Error refreshing planner dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Planner Dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h3 className="font-semibold">Error Loading Dashboard</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No data available</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          {isLoading ? (
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
      
      <PlannerDashboard data={data} />
    </div>
  );
};

export default PlannerDashboardContainer; 