import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ArrowLeft, PauseCircle } from "lucide-react";
import JobSearchBar from "./JobDetailsComponents/JobSearchBar";
import JobBarsChart from "./JobDetailsComponents/JobBarsChart";
import DetailedJobModal from "./JobDetailsComponents/DetailedJobModal";

interface CompletedJob {
  id: number;
  nrcJobNo: string;
  jobPlanId: number;
  jobDemand: string;
  jobDetails: {
    id: number;
    srNo: number;
    noUps: string;
    width: number;
    height: string;
    length: number;
    status: string;
    preRate: number;
    styleId: string;
    clientId: string;
    boardSize: string;
    jobDemand: string;
    customerName: string;
    boxDimensions: string;
    processColors: string;
    artworkApprovedDate: string;
    artworkReceivedDate: string;
    shadeCardApprovalDate: string;
  };
  purchaseOrderDetails: {
    id: number;
    unit: string;
    poDate: string;
    status: string;
    customer: string;
    poNumber: string;
    noOfSheets: number;
    totalPOQuantity: number;
    deliveryDate: string;
  };
  allSteps: Array<{
    id: number;
    stepName: string;
    status: string;
    startDate: string;
    endDate: string;
    machineDetails: Array<{
      unit: string;
      machineId: string;
      machineCode: string;
      machineType: string;
    }>;
  }>;
  completedAt: string;
  completedBy: string;
  finalStatus: string;
  createdAt: string;
  // Keep the optional properties for backward compatibility
  status?: string;
  company?: string;
  customerName?: string;
  totalDuration?: number;
  steps?: any[];
}

interface EnhancedJobDetails {
  nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  fluteType: string;
  status: string;
  latestRate: number;
  preRate: number;
  length: number;
  width: number;
  height: string;
  boxDimensions: string;
  diePunchCode: number;
  boardCategory: string;
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
  noUps: string;
  artworkReceivedDate: string;
  artworkApprovedDate: string;
  shadeCardApprovalDate: string;
  sharedCardDiffDate: string | null;
  srNo: number;
  jobDemand: string;
  imageURL: string | null;
  noOfSheets: number | null;
  isMachineDetailsFilled: boolean;
  createdAt: string | null;
  updatedAt: string;
  userId: string | null;
  machineId: string;
  clientId: string;
  styleId: string;
  hasPurchaseOrders: boolean;
}

interface PurchaseOrderDetails {
  id: number;
  boardSize: string;
  customer: string;
  deliveryDate: string;
  dieCode: number;
  dispatchDate: string;
  dispatchQuantity: number;
  fluteType: string;
  jockeyMonth: string;
  noOfUps: number;
  nrcDeliveryDate: string;
  noOfSheets: number;
  poDate: string;
  poNumber: string;
  pendingQuantity: number;
  pendingValidity: number;
  plant: string;
  shadeCardApprovalDate: string;
  sharedCardDiffDate: number;
  srNo: number;
  style: string;
  totalPOQuantity: number;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobNrcJobNo: string;
  userId: string | null;
}

interface POJobPlanning {
  poId: number;
  poNumber: string;
  poQuantity: number;
  poStatus: string;
  poDate: string;
  hasJobPlanning: boolean;
  jobPlanId: number;
  steps: JobPOStep[];
  assignedMachines: any[];
  completedSteps: number;
  totalSteps: number;
}

interface JobPOStep {
  id: number;
  stepNo: number;
  stepName: string;
  machineDetails: MachineDetail[];
  jobPlanningId: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  user: string | null;
  startDate: string | null;
  endDate: string | null;
  poId: number;
  poSpecificQuantity: number;
}

interface MachineDetail {
  unit: string;
  machineId: string | null;
  machineCode: string | null;
  machineType: string;
}

// Use the same interfaces as your InProgressJobs component
interface JobPlan {
  id: number;
  nrcJobNo: string;
  company: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
  status: string;
  steps: JobPlanStep[];
  createdAt: string;
  jobDetails?: EnhancedJobDetails;
  purchaseOrderDetails?: PurchaseOrderDetails[];
  poJobPlannings?: POJobPlanning[];
}

interface JobPlanStep {
  id: number;
  stepName: string;
  status: string;
  stepDetails?: any;
  updatedAt?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  user?: string;
}

// ... (copy the other interfaces from your InProgressJobs component)

const HeldJobs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heldJobs, setHeldJobs] = useState<JobPlan[]>([]);

  // Extract state data passed from dashboard
  const {
    heldJobs: passedHeldJobs,
    dateFilter,
    customDateRange,
  } = location.state || {};

  // Helper function to check if a job has recent step activity
  const hasRecentStepActivity = (
    job: JobPlan,
    startDate: string,
    endDate: string
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return job.steps.some((step) => {
      if (step.updatedAt) {
        const stepUpdateDate = new Date(step.updatedAt);
        return stepUpdateDate >= start && stepUpdateDate <= end;
      }
      return false;
    });
  };

  // Helper function to get date range from filter
  const getDateRangeFromFilter = (
    filter: string,
    customRange?: { start: string; end: string }
  ) => {
    if (filter === "custom" && customRange) {
      return { start: customRange.start, end: customRange.end };
    }

    const today = new Date();
    const start = new Date();

    switch (filter) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(today.getDate() - 7);
        break;
      case "month":
        start.setMonth(today.getMonth() - 1);
        break;
      default:
        return null;
    }

    return {
      start: start.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    };
  };

  // Use the same fetchJobWithPODetails function from your InProgressJobs component
  const fetchJobWithPODetails = async (
    nrcJobNo: string,
    accessToken: string
  ) => {
    try {
      const response = await fetch(
        `https://nrprod.nrcontainers.com/api/jobs/${encodeURIComponent(
          nrcJobNo
        )}/with-po-details`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return {
            jobDetails: result.data,
            purchaseOrderDetails: result.data.purchaseOrders || [],
            poJobPlannings: result.data.poJobPlannings || [],
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching job+PO details for ${nrcJobNo}:`, error);
    }
    return {
      jobDetails: null,
      purchaseOrderDetails: [],
      poJobPlannings: [],
    };
  };

  // Fetch held jobs with details
  const fetchHeldJobsWithDetails = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication token not found.");

      // Build query parameters for date filtering if available
      const queryParams = new URLSearchParams();
      if (dateFilter && dateFilter !== "custom") {
        queryParams.append("filter", dateFilter);
      } else if (customDateRange) {
        queryParams.append("startDate", customDateRange.start);
        queryParams.append("endDate", customDateRange.end);
      }

      // Fetch job planning data with date filter
      const jobPlanningUrl = `https://nrprod.nrcontainers.com/api/job-planning/?${queryParams.toString()}`;
      const jobPlanningResponse = await fetch(jobPlanningUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!jobPlanningResponse.ok) {
        throw new Error(
          `Failed to fetch job planning data: ${jobPlanningResponse.status}`
        );
      }

      const jobPlanningResult = await jobPlanningResponse.json();

      if (jobPlanningResult.success && Array.isArray(jobPlanningResult.data)) {
        // Filter only held jobs
        const heldJobsData = jobPlanningResult.data.filter((job: JobPlan) =>
          job.steps.some(
            (step) =>
              step.stepDetails?.data?.status === "hold" ||
              step.stepDetails?.status === "hold"
          )
        );

        // Fetch additional details for each held job using the combined API
        const jobsWithDetails = await Promise.all(
          heldJobsData.map(async (job: JobPlan) => {
            const { jobDetails, purchaseOrderDetails, poJobPlannings } =
              await fetchJobWithPODetails(job.nrcJobNo, accessToken);

            return {
              ...job,
              jobDetails,
              purchaseOrderDetails,
              poJobPlannings,
            };
          })
        );

        setHeldJobs(jobsWithDetails);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch held jobs"
      );
      console.error("Held jobs fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to enhance passed jobs with additional details
  const enhancePassedJobsWithDetails = async (jobs: JobPlan[]) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication token not found.");

      // Apply step-based date filtering if dateFilter is available
      let filteredJobs = jobs;
      if (dateFilter) {
        const dateRange = getDateRangeFromFilter(dateFilter, customDateRange);
        if (dateRange) {
          console.log(
            `Filtering held jobs by step activity for ${dateFilter}:`,
            dateRange
          );
          filteredJobs = jobs.filter((job: JobPlan) => {
            // Check if job has recent step activity within the date range
            const hasActivity = hasRecentStepActivity(
              job,
              dateRange.start,
              dateRange.end
            );
            if (!hasActivity) {
              console.log(
                `Held job ${job.nrcJobNo} has no recent step activity, falling back to creation date`
              );
              // Fallback to job creation date if no step activity
              const jobDate = new Date(job.createdAt)
                .toISOString()
                .split("T")[0];
              return jobDate >= dateRange.start && jobDate <= dateRange.end;
            }
            return hasActivity;
          });
          console.log(
            `Filtered ${jobs.length} held jobs to ${filteredJobs.length} based on step activity`
          );
        }
      }

      const jobsWithDetails = await Promise.all(
        filteredJobs.map(async (job: JobPlan) => {
          // Check if job already has complete details to avoid unnecessary API calls
          if (
            job.jobDetails &&
            job.purchaseOrderDetails &&
            job.poJobPlannings
          ) {
            return job;
          }

          // Fetch complete details using the new combined API
          const { jobDetails, purchaseOrderDetails, poJobPlannings } =
            await fetchJobWithPODetails(job.nrcJobNo, accessToken);

          return {
            ...job,
            jobDetails: jobDetails || job.jobDetails,
            purchaseOrderDetails:
              purchaseOrderDetails || job.purchaseOrderDetails || [],
            poJobPlannings: poJobPlannings || job.poJobPlannings || [],
          };
        })
      );

      setHeldJobs(jobsWithDetails);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enhance job details"
      );
      console.error("Job enhancement error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have passed data from dashboard
    if (passedHeldJobs && Array.isArray(passedHeldJobs)) {
      console.log("Using passed held jobs data:", passedHeldJobs);
      enhancePassedJobsWithDetails(passedHeldJobs);
    } else {
      console.log("No passed data found, fetching held jobs...");
      fetchHeldJobsWithDetails();
    }
  }, [passedHeldJobs]);

  const handleJobClick = (job: CompletedJob | JobPlan) => {
    setSelectedJob(job as JobPlan); // Type assertion since we know it's JobPlan for held jobs
    setIsModalOpen(true);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard", {
      state: {
        dateFilter: dateFilter,
        customDateRange: customDateRange,
      },
    });
  };

  const handleRetry = () => {
    if (passedHeldJobs && Array.isArray(passedHeldJobs)) {
      enhancePassedJobsWithDetails(passedHeldJobs);
    } else {
      fetchHeldJobsWithDetails();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading held jobs with complete details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Held Jobs
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button and Filter Info */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 transition-colors hover:cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          {/* Show current filter if available */}
          {dateFilter && (
            <div className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full">
              Filter:{" "}
              {dateFilter === "custom"
                ? `${customDateRange?.start} to ${customDateRange?.end}`
                : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <JobSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by NRC Job Number..."
          />
        </div>

        {/* Held Jobs Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 p-3 rounded-full">
              <PauseCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Held Jobs
                {dateFilter && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({dateFilter})
                  </span>
                )}
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {heldJobs.length}
              </p>
            </div>
          </div>

          <JobBarsChart
            jobs={heldJobs}
            category="held"
            onJobClick={handleJobClick}
            searchTerm={searchTerm}
          />
        </div>

        {/* Show message if no jobs found */}
        {heldJobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-6 text-center">
            <div className="text-gray-500">
              <PauseCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Held Jobs Found</h3>
              <p className="text-sm">
                {dateFilter
                  ? `No held jobs found for the selected ${dateFilter} period.`
                  : "No held jobs available at the moment."}
              </p>
            </div>
          </div>
        )}

        {/* Detailed Job Modal */}
        <DetailedJobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
        />
      </div>
    </div>
  );
};

export default HeldJobs;
