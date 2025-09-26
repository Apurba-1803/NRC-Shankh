import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import DateFilterComponent, {
  type DateFilterType,
} from "./FilterComponents/DateFilterComponent";
import StatisticsGrid from "./StatisticsCards/StatisticsGrid";
import LineChartComponent from "./ChartComponents/LineChartComponent";
import BarChartComponent from "./ChartComponents/BarChartComponent";
import PieChartComponent from "./ChartComponents/PieChartComponent";
// import AdvancedDataChart from "./ChartComponents/AdvancedDataChart";
import JobPlansTable from "./DataTable/JobPlansTable";
import { useNavigate } from "react-router-dom";
import CompletedJobsTable from "./CompletedJobsTable";
import LoadingSpinner from "../../common/LoadingSpinner";
import MachineUtilizationDashboard from "./MachineUtilization";

// Types based on the API response structure
interface JobPlanStep {
  id: number;
  stepNo: number;
  stepName: string;
  machineDetails: Array<{
    unit: string | null;
    machineId: string | number;
    machineCode: string | null;
    machineType: string;
    machine?: {
      id: string;
      description: string;
      status: string;
      capacity: number;
    };
  }>;
  status: "planned" | "start" | "stop";
  startDate: string | null;
  endDate: string | null;
  user: string | null;
  createdAt: string;
  updatedAt: string;
  stepDetails?: any; // Step-specific details from API endpoints
}

interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  steps: JobPlanStep[];
}

// StepDetails interface removed as it's not used

interface CompletedJob {
  id: number;
  nrcJobNo: string;
  jobPlanId: number;
  jobDemand: string;
  jobDetails: {
    id: number;
    customerName: string;
    preRate: number;
    latestRate: number;
    [key: string]: any;
  };
  purchaseOrderDetails: {
    id: number;
    customer: string;
    unit: string;
    [key: string]: any;
  };
  allSteps: Array<{
    id: number;
    stepName: string;
    machineDetails: Array<{
      unit: string | null;
      machineId: string;
      machineCode: string | null;
      machineType: string;
    }>;
    dispatchProcess?: {
      id: number;
      quantity: number;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
  completedAt: string;
  completedBy: string;
  [key: string]: any;
}

interface AdminDashboardData {
  jobPlans: JobPlan[];
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  plannedJobs: number;
  totalSteps: number;
  completedSteps: number;
  activeUsers: number;
  efficiency: number;
  stepCompletionStats: {
    [key: string]: { 
      completed: number; 
      inProgress: number; 
      planned: number;
      // Add the actual data arrays
      completedData: JobPlan[];
      inProgressData: JobPlan[];
      plannedData: JobPlan[];
    };
  };
  machineUtilization: MachineUtilizationData;
  timeSeriesData: Array<{
    date: string;
    jobsStarted: number;
    jobsCompleted: number;
    totalSteps: number;
    completedSteps: number;
  }>;
  completedJobsData: CompletedJob[];
 
}

interface MachineDetails {
  id: string;
  machineCode: string;
  machineType: string;
  description: string;
  status: string;
  capacity: number;
  unit: string;
  jobs: Array<{
    id: number;
    nrcJobNo: string;
    customerName: string;
    status: string;
  }>;
}

interface MachineUtilizationData {
  machineStats: Record<string, { total: number; available: number; inUse: number }>;
  machineDetails: MachineDetails[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  // selectedJobPlan state removed as it's not used

  // Color scheme for charts
  const colors = {
    primary: "#00AEEF",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    warning: "#F97316",
    info: "#3B82F6",
    success: "#22C55E",
    gray: "#6B7280",
  };

  // stepColors removed as it's not used

  // Handle Total Jobs card click
 // Handle Total Jobs card click
const handleTotalJobsClick = () => {
  navigate("/dashboard/job-details", {
    state: {
      jobData: {
        totalJobs: filteredData?.totalJobs || 0,
        completedJobs: filteredData?.completedJobs || 0,
        inProgressJobs: filteredData?.inProgressJobs || 0,
        plannedJobs: filteredData?.plannedJobs || 0,
      },
      // Pass the filtered job plans and completed jobs data
      filteredJobPlans: filteredData?.jobPlans || [],
      filteredCompletedJobs: filteredData?.completedJobsData || [],
      dateFilter: dateFilter,
      customDateRange: customDateRange
    },
  });
};

// Handle Completed Jobs card click
const handleCompletedJobsClick = () => {
  console.log("Completed Jobs card clicked - navigating to completed jobs view");
  navigate("/dashboard/completed-jobs", {
    state: {
      completedJobs: filteredData?.completedJobsData || [],
      dateFilter: dateFilter,
      customDateRange: customDateRange
    }
  });
};

// Handle In Progress Jobs card click
// Handle In Progress Jobs card click
const handleInProgressJobsClick = () => {
  console.log("In Progress Jobs card clicked - navigating to in-progress jobs view");
  
  // 🔥 UPDATED: Use the same logic as processJobPlanData
  const inProgressJobPlans = filteredData?.jobPlans?.filter(jobPlan => {
    let jobInProgress = false;

    // Check each step to determine if job is in progress
    jobPlan.steps.forEach(step => {
      if (
        step.status === "start" ||
        (step.stepDetails && step.stepDetails.status === "in_progress")
      ) {
        jobInProgress = true;
      }
    });

    return jobInProgress;
  }) || [];

  navigate("/dashboard/in-progress-jobs", {
    state: {
      inProgressJobs: inProgressJobPlans,
      dateFilter: dateFilter,
      customDateRange: customDateRange
    }
  });
};


// Handle Planned Jobs card click
// Handle Planned Jobs card click
const handlePlannedJobsClick = () => {
  console.log("Planned Jobs card clicked - navigating to planned jobs view");
  
  // 🔥 UPDATED: Use the same logic as processJobPlanData
  const plannedJobPlans = filteredData?.jobPlans?.filter(jobPlan => {
    let jobCompleted = true;
    let jobInProgress = false;

    // Check each step to determine job status
    jobPlan.steps.forEach(step => {
      if (
        step.status === "stop" || 
        (step.stepDetails && step.stepDetails.status === "accept")
      ) {
        // This step is completed - continue checking other steps
      } else if (
        step.status === "start" ||
        (step.stepDetails && step.stepDetails.status === "in_progress")
      ) {
        // This step is in progress
        jobInProgress = true;
        jobCompleted = false;
      } else {
        // This step is planned (not started)
        jobCompleted = false;
      }
    });

    // 🔥 FIXED: A job is "planned" if it's not completed AND not in progress
    // This matches the logic from processJobPlanData
    return !jobCompleted && !jobInProgress;
  }) || [];

  navigate("/dashboard/planned-jobs", {
    state: {
      plannedJobs: plannedJobPlans,
      dateFilter: dateFilter,
      customDateRange: customDateRange
    }
  });
};


  // Fetch step-specific details for a job
  const fetchStepDetails = async (
    stepName: string,
    jobNrcJobNo: string,
    accessToken: string
  ) => {
    try {
      let endpoint = "";
      switch (stepName) {
        case "PaperStore":
          endpoint = `https://nrprod.nrcontainers.com/api/paper-store/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "PrintingDetails":
          endpoint = `https://nrprod.nrcontainers.com/api/printing-details/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "Corrugation":
          endpoint = `https://nrprod.nrcontainers.com/api/corrugation/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "FluteLaminateBoardConversion":
          endpoint = `https://nrprod.nrcontainers.com/api/flute-laminate-board-conversion/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "Punching":
          endpoint = `https://nrprod.nrcontainers.com/api/punching/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "SideFlapPasting":
          endpoint = `https://nrprod.nrcontainers.com/api/side-flap-pasting/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "QualityDept":
          endpoint = `https://nrprod.nrcontainers.com/api/quality-dept/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        case "DispatchProcess":
          endpoint = `https://nrprod.nrcontainers.com/api/dispatch-process/by-job/${encodeURIComponent(
            jobNrcJobNo
          )}`;
          break;
        default:
          return null;
      }

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        console.warn(
          `Failed to fetch ${stepName} details for job ${jobNrcJobNo}: ${response.status}`
        );
        return null;
      }

      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0]; // Return the first (and usually only) record
      }
      return null;
    } catch (err) {
      console.warn(
        `Error fetching ${stepName} details for job ${jobNrcJobNo}:`,
        err
      );
      return null;
    }
  };

  // Add this new function to fetch machine data
// Add this function at the top level
const fetchMachineUtilization = async (): Promise<MachineUtilizationData> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Authentication token not found.');
    }

    const response = await fetch('https://nrprod.nrcontainers.com/api/machines?', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch machines: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid API response format');
    }

    // Process machines by type for stats
    const machineStats: Record<string, { total: number; available: number; inUse: number }> = {};
    
    // Store individual machine details
    const machineDetails: MachineDetails[] = [];
    
    data.data.forEach((machine: any) => {
      // Skip inactive machines
      if (!machine.isActive) return;
      
      const machineType = machine.machineType;
      
      // Add to individual machine details
      machineDetails.push({
        id: machine.id,
        machineCode: machine.machineCode,
        machineType: machine.machineType,
        description: machine.description,
        status: machine.status,
        capacity: machine.capacity,
        unit: machine.unit,
        jobs: machine.jobs || []
      });
      
      // Initialize stats if not exists
      if (!machineStats[machineType]) {
        machineStats[machineType] = { total: 0, available: 0, inUse: 0 };
      }
      
      // Count totals
      machineStats[machineType].total++;
      
      // Count by status
      switch (machine.status.toLowerCase()) {
        case 'available':
          machineStats[machineType].available++;
          break;
        case 'busy':
        case 'in_use':
        case 'occupied':
          machineStats[machineType].inUse++;
          break;
        default:
          // For other statuses (maintenance, etc.), don't count as available or in use
          break;
      }
    });

    return {
      machineStats,
      machineDetails
    };
  } catch (error) {
    console.error('Error fetching machine utilization:', error);
    return {
      machineStats: {},
      machineDetails: []
    };
  }
};

const mergeStepCompletionStats = (stepStats: {
  [key: string]: { 
    completed: number; 
    inProgress: number; 
    planned: number;
    completedData: JobPlan[];
    inProgressData: JobPlan[];
    plannedData: JobPlan[];
  };
}) => {
  // Define mapping for duplicate steps
  const stepMappings = {
    'Printing': ['Printing', 'PrintingDetails'],
    'Flute Lamination': ['Flute Lamination', 'FluteLaminateBoardConversion'],
    'Quality Control': ['Quality Control', 'QualityDept'],
    'Flap Pasting': ['Flap Pasting', 'SideFlapPasting'],
    'Paper Store': ['Paper Store', 'PaperStore'],
    'Dispatch': ['Dispatch', 'DispatchProcess']
  };

  const mergedStats: {
    [key: string]: { 
      completed: number; 
      inProgress: number; 
      planned: number;
      completedData: JobPlan[];
      inProgressData: JobPlan[];
      plannedData: JobPlan[];
    };
  } = {};

  const processedKeys = new Set<string>();

  // Process each step in the original stats
  Object.keys(stepStats).forEach(stepName => {
    if (processedKeys.has(stepName)) return;

    // Find if this step belongs to any mapping group
    let masterKey = stepName;
    let foundGroup = false;

    for (const [master, variants] of Object.entries(stepMappings)) {
      if (variants.includes(stepName)) {
        masterKey = master;
        foundGroup = true;
        break;
      }
    }

    // Initialize the master key if not exists
    if (!mergedStats[masterKey]) {
      mergedStats[masterKey] = { 
        completed: 0, 
        inProgress: 0, 
        planned: 0,
        completedData: [],
        inProgressData: [],
        plannedData: []
      };
    }

    if (foundGroup) {
      // Aggregate all variants of this step
      const variants = stepMappings[masterKey as keyof typeof stepMappings];
      variants.forEach(variant => {
        if (stepStats[variant]) {
          mergedStats[masterKey].completed += stepStats[variant].completed;
          mergedStats[masterKey].inProgress += stepStats[variant].inProgress;
          mergedStats[masterKey].planned += stepStats[variant].planned;
          
          // Merge the data arrays
          mergedStats[masterKey].completedData.push(...stepStats[variant].completedData);
          mergedStats[masterKey].inProgressData.push(...stepStats[variant].inProgressData);
          mergedStats[masterKey].plannedData.push(...stepStats[variant].plannedData);
          
          processedKeys.add(variant);
        }
      });
    } else {
      // Single step, just copy the data
      mergedStats[masterKey].completed += stepStats[stepName].completed;
      mergedStats[masterKey].inProgress += stepStats[stepName].inProgress;
      mergedStats[masterKey].planned += stepStats[stepName].planned;
      
      // Copy the data arrays
      mergedStats[masterKey].completedData.push(...stepStats[stepName].completedData);
      mergedStats[masterKey].inProgressData.push(...stepStats[stepName].inProgressData);
      mergedStats[masterKey].plannedData.push(...stepStats[stepName].plannedData);
      
      processedKeys.add(stepName);
    }
  });

  return mergedStats;
};



// Updated fetchDashboardData - make it async and await processJobPlanData
const fetchDashboardData = async (
  filterType?: DateFilterType,
  customRange?: { start: string; end: string }
) => {
  try {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) throw new Error("Authentication token not found.");

    // Build query parameters for date filtering
    const queryParams = new URLSearchParams();
    if (filterType && filterType !== "custom") {
      queryParams.append("filter", filterType);
    } else if (customRange) {
      queryParams.append("startDate", customRange.start);
      queryParams.append("endDate", customRange.end);
    }

    // Fetch filtered job planning data
    const jobPlanningUrl = `https://nrprod.nrcontainers.com/api/job-planning/?${queryParams.toString()}`;
    const jobPlanningResponse = await fetch(jobPlanningUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!jobPlanningResponse.ok) {
      throw new Error(
        `Failed to fetch job planning data: ${jobPlanningResponse.status}`
      );
    }

    const jobPlanningResult = await jobPlanningResponse.json();

    // Fetch filtered completed jobs data
    const completedJobsUrl = `https://nrprod.nrcontainers.com/api/completed-jobs?${queryParams.toString()}`;
    const completedJobsResponse = await fetch(completedJobsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let completedJobsData: CompletedJob[] = [];
    if (completedJobsResponse.ok) {
      const completedJobsResult = await completedJobsResponse.json();
      if (
        completedJobsResult.success &&
        Array.isArray(completedJobsResult.data)
      ) {
        completedJobsData = completedJobsResult.data;
      }
    }

    if (jobPlanningResult.success && Array.isArray(jobPlanningResult.data)) {
      const jobPlans = jobPlanningResult.data;

      // Fetch step details for each job plan
      const jobPlansWithDetails = await Promise.all(
        jobPlans.map(async (jobPlan: JobPlan) => {
          const stepsWithDetails = await Promise.all(
            jobPlan.steps.map(async (step: JobPlanStep) => {
              let stepDetails = null;
              if (step.status === "start" || step.status === "stop") {
                stepDetails = await fetchStepDetails(
                  step.stepName,
                  jobPlan.nrcJobNo,
                  accessToken
                );
              }

              return {
                ...step,
                stepDetails,
              };
            })
          );

          return {
            ...jobPlan,
            steps: stepsWithDetails,
          };
        })
      );

      // Process the data to create dashboard statistics - AWAIT this call
      const processedData = await processJobPlanData(
        jobPlansWithDetails,
        completedJobsData
      );

      setData(processedData);
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to fetch dashboard data"
    );
    console.error("Dashboard data fetch error:", err);
  } finally {
    setLoading(false);
  }
};

// Updated processJobPlanData - fetch machines once, not in loop
const processJobPlanData = async (
  jobPlans: JobPlan[],
  completedJobsData: CompletedJob[]
): Promise<AdminDashboardData> => {
  // Count completed jobs from the completed jobs API
  const completedJobsCount = completedJobsData.length;

  // Fetch machine data once at the beginning
  const machineStats = await fetchMachineUtilization();

  // Count jobs from job planning API (these are in progress or planned)
  const totalJobs = jobPlans.length;
  let inProgressJobs = 0;
  let plannedJobs = 0;
  let totalSteps = 0;
  let completedSteps = 0;
  const uniqueUsers = new Set<string>();

  const stepStats: {
    [key: string]: { 
      completed: number; 
      inProgress: number; 
      planned: number;
      completedData: JobPlan[];
      inProgressData: JobPlan[];
      plannedData: JobPlan[];
    };
  } = {};
  
  const timeSeriesData: Array<{
    date: string;
    jobsStarted: number;
    jobsCompleted: number;
    totalSteps: number;
    completedSteps: number;
  }> = [];

  // Initialize step statistics
  const stepNames = [
    "PaperStore",
    "PrintingDetails", 
    "Corrugation",
    "FluteLaminateBoardConversion",
    "Punching",
    "SideFlapPasting",
    "QualityDept",
    "DispatchProcess",
  ];

  // ✅ Helper function for step variants
  const isStepVariant = (stepCategory: string, actualStepName: string): boolean => {
    const stepMappings: { [key: string]: string[] } = {
      'PaperStore': ['PaperStore', 'Paper Store'],
      'PrintingDetails': ['PrintingDetails', 'Printing'],
      'Corrugation': ['Corrugation'],
      'FluteLaminateBoardConversion': ['FluteLaminateBoardConversion', 'Flute Lamination'],
      'Punching': ['Punching'],
      'SideFlapPasting': ['SideFlapPasting', 'Flap Pasting'],
      'QualityDept': ['QualityDept', 'Quality Control'],
      'DispatchProcess': ['DispatchProcess', 'Dispatch'],
    };

    return stepMappings[stepCategory]?.includes(actualStepName) || stepCategory === actualStepName;
  };
  
  stepNames.forEach((step) => {
    stepStats[step] = { 
      completed: 0, 
      inProgress: 0, 
      planned: 0,
      completedData: [],
      inProgressData: [],
      plannedData: []
    };
  });

  // Process each job plan
  jobPlans.forEach((jobPlan) => {
    let jobCompleted = true;
    let jobInProgress = false;
    const totalStepsInJob = jobPlan.steps.length;
    let completedStepsInJob = 0;

    totalSteps += totalStepsInJob;

    // ✅ FIXED: Process each step category separately
    stepNames.forEach((stepName) => {
      // Find the matching step for this category in this job
      const matchingStep = jobPlan.steps.find(step => 
        isStepVariant(stepName, step.stepName)
      );

      if (matchingStep) {
        // Categorize based on the matching step's status
        if (
          matchingStep.status === "stop" || 
          (matchingStep.stepDetails && matchingStep.stepDetails.status === "accept")
        ) {
          // This step is completed
          stepStats[stepName].completed++;
          stepStats[stepName].completedData.push(jobPlan);
          completedStepsInJob++;
          completedSteps++;
        } else if (
          matchingStep.status === "start" ||
          (matchingStep.stepDetails && matchingStep.stepDetails.status === "in_progress")
        ) {
          // This step is in progress
          stepStats[stepName].inProgress++;
          stepStats[stepName].inProgressData.push(jobPlan);
          jobInProgress = true;
          jobCompleted = false;
        } else {
          // This step is planned
          stepStats[stepName].planned++;
          stepStats[stepName].plannedData.push(jobPlan);
          jobCompleted = false;
        }

        // Track unique users
        if (matchingStep.user) {
          uniqueUsers.add(matchingStep.user);
        }
      }
    });

    // ✅ SAFETY CHECK: Handle steps not in our predefined list
    jobPlan.steps.forEach((step) => {
      // Only process steps that are not already handled by the main logic
      const isHandled = stepNames.some(stepName => isStepVariant(stepName, step.stepName));
      
      if (!isHandled) {
        // SAFETY CHECK: Ensure stepStats exists for this step name
        if (!stepStats[step.stepName]) {
          stepStats[step.stepName] = {
            completed: 0,
            inProgress: 0,
            planned: 0,
            completedData: [],
            inProgressData: [],
            plannedData: []
          };
        }

        // Process the unhandled step
        if (
          step.status === "stop" || 
          (step.stepDetails && step.stepDetails.status === "accept")
        ) {
          stepStats[step.stepName].completed++;
          stepStats[step.stepName].completedData.push(jobPlan);
        } else if (
          step.status === "start" ||
          (step.stepDetails && step.stepDetails.status === "in_progress")
        ) {
          stepStats[step.stepName].inProgress++;
          stepStats[step.stepName].inProgressData.push(jobPlan);
          jobInProgress = true;
          jobCompleted = false;
        } else {
          stepStats[step.stepName].planned++;
          stepStats[step.stepName].plannedData.push(jobPlan);
          jobCompleted = false;
        }

        // Track unique users
        if (step.user) {
          uniqueUsers.add(step.user);
        }
      }
    });

    // Determine job status
    if (jobCompleted) {
      // This job is completed, but we're not counting it here since it comes from completed jobs API
    } else if (jobInProgress) {
      inProgressJobs++;
    } else {
      plannedJobs++;
    }

    // Add to time series data
    const jobDate = new Date(jobPlan.createdAt).toISOString().split("T")[0];
    const existingDateIndex = timeSeriesData.findIndex(
      (item) => item.date === jobDate
    );

    if (existingDateIndex >= 0) {
      timeSeriesData[existingDateIndex].totalSteps += totalStepsInJob;
      timeSeriesData[existingDateIndex].completedSteps += completedStepsInJob;
      if (jobInProgress) timeSeriesData[existingDateIndex].jobsStarted++;
    } else {
      timeSeriesData.push({
        date: jobDate,
        jobsStarted: jobInProgress ? 1 : 0,
        jobsCompleted: 0,
        totalSteps: totalStepsInJob,
        completedSteps: completedStepsInJob,
      });
    }
  });

  console.log("completed jobs", completedJobsData);

  // Process completed jobs data for time series
  completedJobsData.forEach((completedJob) => {
    const poDate = completedJob.purchaseOrderDetails?.poDate;

    if (poDate) {
      const completedDate = new Date(poDate).toISOString().split("T")[0];
      const existingDateIndex = timeSeriesData.findIndex(
        (item) => item.date === completedDate
      );

      if (existingDateIndex >= 0) {
        timeSeriesData[existingDateIndex].jobsCompleted++;
      } else {
        timeSeriesData.push({
          date: completedDate,
          jobsStarted: 0,
          jobsCompleted: 1,
          totalSteps: 0,
          completedSteps: 0,
        });
      }
    } else {
      console.warn(`Job ${completedJob.id} has no purchase order date, skipping...`);
    }
  });

  // Sort time series data by date
  timeSeriesData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate efficiency
  const efficiency =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const mergedStepStats = mergeStepCompletionStats(stepStats);

  return {
    jobPlans,
    totalJobs: totalJobs + completedJobsCount,
    completedJobs: completedJobsCount,
    inProgressJobs,
    plannedJobs,
    totalSteps,
    completedSteps,
    activeUsers: uniqueUsers.size,
    efficiency,
    stepCompletionStats: mergedStepStats,
    machineUtilization: machineStats,
    timeSeriesData,
    completedJobsData: completedJobsData,
  };
};

  

  // Handle filter changes
  const handleFilterChange = (
    newFilter: DateFilterType,
    customRange?: { start: string; end: string }
  ) => {
    fetchDashboardData(newFilter, customRange);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Data is now filtered at the API level, so we use the data directly
  // const filteredData = data;

// Helper function to check if a date falls within the selected range
// Helper function to check if a date falls within the selected range
const isDateInRange = (date: string | Date, startDate: Date, endDate: Date): boolean => {
  const checkDate = new Date(date);
  // Reset time to start of day for accurate comparison
  checkDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return checkDate >= startDate && checkDate <= endDate;
};

// Calculate date range based on your filter options
const getDateRange = (filter: DateFilterType, customRange?: {start: string; end: string}) => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date = new Date(today);

  switch (filter) {
    case 'today':
      startDate = new Date(today);
      endDate = new Date(today);
      break;
    case 'week':
      // This week (from Monday to Sunday)
      startDate = new Date(today);
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
      startDate.setDate(today.getDate() - daysToMonday);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'month':
      // This month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'quarter':
      // This quarter
      const currentQuarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
      endDate = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
      break;
    case 'year':
      // This year
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
    case 'custom':
      if (customRange) {
        startDate = new Date(customRange.start);
        endDate = new Date(customRange.end);
      } else {
        // Fallback to today if no custom range
        startDate = new Date(today);
        endDate = new Date(today);
      }
      break;
    default:
      // Show all data
      return null;
  }

  return { startDate, endDate };
};

// Filter the data based on selected dates
// 🔥 FIXED: filteredData useMemo with consistent logic
const filteredData = useMemo(() => {
  if (!data) return null;

  // If no date filter is applied, return all data
  if (!dateFilter) return data;

  const dateRange = getDateRange(dateFilter, customDateRange);
  
  // If no date range specified, return all data
  if (!dateRange) return data;

  const { startDate, endDate } = dateRange;

  console.log('Filtering data from:', startDate.toDateString(), 'to:', endDate.toDateString());

  // Filter jobPlans based on createdAt date
  const filteredJobPlans = data.jobPlans.filter(jobPlan => {
    const jobDate = new Date(jobPlan.createdAt);
    return isDateInRange(jobDate, new Date(startDate), new Date(endDate));
  });

  // Filter completedJobsData based on poDate
  const filteredCompletedJobsData = data.completedJobsData.filter(completedJob => {
    const poDate = completedJob.purchaseOrderDetails?.poDate;
    if (!poDate) return false;
    return isDateInRange(poDate, new Date(startDate), new Date(endDate));
  });

  // Filter timeSeriesData based on date
  const filteredTimeSeriesData = data.timeSeriesData.filter(timeData => {
    return isDateInRange(timeData.date, new Date(startDate), new Date(endDate));
  });

  // 🔥 RECALCULATE USING THE SAME LOGIC AS processJobPlanData
  const totalJobs = filteredJobPlans.length;
  const completedJobs = filteredCompletedJobsData.length;
  
  let inProgressJobs = 0;
  let plannedJobs = 0;
  let totalSteps = 0;
  let completedSteps = 0;
  const uniqueUsers = new Set<string>();

  // 🔥 UPDATED: Process each job plan using the exact same logic
  filteredJobPlans.forEach(jobPlan => {
    let jobCompleted = true;
    let jobInProgress = false;
    const totalStepsInJob = jobPlan.steps.length;
    let completedStepsInJob = 0;

    totalSteps += totalStepsInJob;

    // 🔥 IMPORTANT: Use the exact same step processing logic
    jobPlan.steps.forEach(step => {
      // Track unique users
      if (step.user) {
        uniqueUsers.add(step.user);
      }

      // 🔥 FIXED: Use the same categorization logic as processJobPlanData
      if (
        step.status === "stop" || 
        (step.stepDetails && step.stepDetails.status === "accept")
      ) {
        // This step is completed
        completedStepsInJob++;
        completedSteps++;
      } else if (
        step.status === "start" ||
        (step.stepDetails && step.stepDetails.status === "in_progress")
      ) {
        // This step is in progress
        jobInProgress = true;
        jobCompleted = false;
      } else {
        // This step is planned (not started)
        jobCompleted = false;
      }
    });

    // 🔥 FIXED: Use the same job categorization logic
    if (jobCompleted) {
      // This job is completed, but we're not counting it here since it comes from completed jobs API
      // NOTE: This case should not happen for job plans
    } else if (jobInProgress) {
      inProgressJobs++;
    } else {
      plannedJobs++;
    }
  });

  // 🔥 RECALCULATE STEP STATS USING SAME LOGIC (if needed for step completion stats)
  const stepCompletionStats: Record<string, {
    completed: number;
    inProgress: number;
    planned: number;
    completedData: any[];
    inProgressData: any[];
    plannedData: any[];
  }> = {};

  // Initialize step stats using the same step names as processJobPlanData
  const stepNames = ["PaperStore", "PrintingDetails", "Corrugation", "FluteLaminateBoardConversion", "Punching", "SideFlapPasting", "QualityDept", "DispatchProcess"];
  
  stepNames.forEach(stepName => {
    stepCompletionStats[stepName] = {
      completed: 0,
      inProgress: 0,
      planned: 0,
      completedData: [],
      inProgressData: [],
      plannedData: []
    };
  });

  // 🔥 HELPER FUNCTION: Same as processJobPlanData
  const isStepVariant = (stepCategory: string, actualStepName: string): boolean => {
    const stepMappings: { [key: string]: string[] } = {
      'PaperStore': ['PaperStore', 'Paper Store'],
      'PrintingDetails': ['PrintingDetails', 'Printing'],
      'Corrugation': ['Corrugation'],
      'FluteLaminateBoardConversion': ['FluteLaminateBoardConversion', 'Flute Lamination'],
      'Punching': ['Punching'],
      'SideFlapPasting': ['SideFlapPasting', 'Flap Pasting'],
      'QualityDept': ['QualityDept', 'Quality Control'],
      'DispatchProcess': ['DispatchProcess', 'Dispatch'],
    };

    return stepMappings[stepCategory]?.includes(actualStepName) || stepCategory === actualStepName;
  };

  // Process step completion stats using the same logic
  filteredJobPlans.forEach(jobPlan => {
    stepNames.forEach(stepName => {
      const matchingStep = jobPlan.steps.find(step => 
        isStepVariant(stepName, step.stepName)
      );

      if (matchingStep) {
        if (
          matchingStep.status === "stop" || 
          (matchingStep.stepDetails && matchingStep.stepDetails.status === "accept")
        ) {
          stepCompletionStats[stepName].completed++;
          stepCompletionStats[stepName].completedData.push(jobPlan);
        } else if (
          matchingStep.status === "start" ||
          (matchingStep.stepDetails && matchingStep.stepDetails.status === "in_progress")
        ) {
          stepCompletionStats[stepName].inProgress++;
          stepCompletionStats[stepName].inProgressData.push(jobPlan);
        } else {
          stepCompletionStats[stepName].planned++;
          stepCompletionStats[stepName].plannedData.push(jobPlan);
        }
      }
    });

    // Handle steps not in predefined list (same as processJobPlanData)
    jobPlan.steps.forEach(step => {
      const isHandled = stepNames.some(stepName => isStepVariant(stepName, step.stepName));
      
      if (!isHandled) {
        if (!stepCompletionStats[step.stepName]) {
          stepCompletionStats[step.stepName] = {
            completed: 0,
            inProgress: 0,
            planned: 0,
            completedData: [],
            inProgressData: [],
            plannedData: []
          };
        }

        if (
          step.status === "stop" || 
          (step.stepDetails && step.stepDetails.status === "accept")
        ) {
          stepCompletionStats[step.stepName].completed++;
          stepCompletionStats[step.stepName].completedData.push(jobPlan);
        } else if (
          step.status === "start" ||
          (step.stepDetails && step.stepDetails.status === "in_progress")
        ) {
          stepCompletionStats[step.stepName].inProgress++;
          stepCompletionStats[step.stepName].inProgressData.push(jobPlan);
        } else {
          stepCompletionStats[step.stepName].planned++;
          stepCompletionStats[step.stepName].plannedData.push(jobPlan);
        }
      }
    });
  });

  // Calculate efficiency
  const efficiency = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Use your existing mergeStepCompletionStats function
  const mergedStepStats = mergeStepCompletionStats(stepCompletionStats);

  console.log('🔍 Filtered Data Results:');
  console.log('Total filtered jobPlans:', filteredJobPlans.length);
  console.log('Completed jobs:', completedJobs);
  console.log('In progress jobs:', inProgressJobs);
  console.log('Planned jobs:', plannedJobs);
  console.log('Total jobs:', totalJobs + completedJobs);

  return {
    ...data, // Keep machine utilization and other non-date-dependent data
    jobPlans: filteredJobPlans,
    totalJobs: totalJobs + completedJobs, // Total includes both in-progress and completed
    completedJobs,
    inProgressJobs,
    plannedJobs,
    totalSteps,
    completedSteps,
    activeUsers: uniqueUsers.size,
    efficiency,
    stepCompletionStats: mergedStepStats,
    timeSeriesData: filteredTimeSeriesData,
    completedJobsData: filteredCompletedJobsData,
  };
}, [data, dateFilter, customDateRange]);





  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <LoadingSpinner size="lg" variant="inline" />
        <p className="ml-4 text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          className="mt-4 bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!filteredData) {
    return <div>No data available</div>;
  }
  console.log("filtered", filteredData)



  return (
    <div className="p-4 sm:p-6 lg:p-8  min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Calendar className="text-gray-500" size={20} />
            <span className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Date Filter Controls */}
        <DateFilterComponent
          dateFilter={dateFilter}
          setDateFilter={(filter) => {
            setDateFilter(filter);
            handleFilterChange(filter);
          }}
          customDateRange={customDateRange}
          setCustomDateRange={(range) => {
            setCustomDateRange(range);
            handleFilterChange("custom", range);
          }}
        />
      </div>

      {/* Statistics Grid */}
      <StatisticsGrid
        totalJobs={filteredData?.totalJobs || 0}
        completedJobs={filteredData?.completedJobs || 0}
        inProgressJobs={filteredData?.inProgressJobs || 0}
        plannedJobs={filteredData?.plannedJobs || 0}
        // totalSteps={filteredData.totalSteps}
        // completedSteps={filteredData.completedSteps}
        activeUsers={filteredData?.activeUsers || 0}
        // efficiency={filteredData?.efficiency || 0}
        className="mb-8"
        onTotalJobsClick={handleTotalJobsClick}
        onCompletedJobsClick={handleCompletedJobsClick}
        onInProgressJobsClick={handleInProgressJobsClick}
        onPlannedJobsClick={handlePlannedJobsClick}
      />

      {/* Completed Jobs Summary Table - Moved here below statistics grid */}
      {filteredData.completedJobsData &&
        filteredData.completedJobsData.length > 0 && (
          <CompletedJobsTable
            data={filteredData.completedJobsData}
            className="mb-8"
          />
        )}

      {/* Production Summary Cards - Commented out for now
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(() => {
          // Calculate total quantities from step details
          let totalQuantity = 0;
          let totalWastage = 0;
          let totalRejected = 0;
          let totalDispatched = 0;

          filteredData.jobPlans.forEach(jobPlan => {
            jobPlan.steps.forEach(step => {
              if (step.stepDetails) {
                const details = step.stepDetails;
                
                // Sum quantities from different step types
                if (details.quantity) {
                  totalQuantity += details.quantity;
                }
                
                // Sum wastage
                if (details.wastage) {
                  totalWastage += details.wastage;
                }
                
                // Sum rejected quantities (from QualityDept)
                if (details.rejectedQty) {
                  totalRejected += details.rejectedQty;
                }
                
                // Sum dispatched quantities (from DispatchProcess)
                if (details.quantity && step.stepName === 'DispatchProcess') {
                  totalDispatched += details.quantity;
                }
              }
            });
          });

          return [
            {
              title: 'Total Production Qty',
              value: totalQuantity.toLocaleString(),
              icon: '📦',
              color: 'bg-blue-100 text-blue-800 border-blue-300'
            },
            {
              title: 'Total Wastage',
              value: totalWastage.toLocaleString(),
              icon: '🗑️',
              color: 'bg-red-100 text-red-800 border-red-300'
            },
            {
              title: 'Total Rejected',
              value: totalRejected.toLocaleString(),
              icon: '❌',
              color: 'bg-orange-100 text-orange-800 border-orange-300'
            },
            {
              title: 'Total Dispatched',
              value: totalDispatched.toLocaleString(),
              icon: '🚚',
              color: 'bg-green-100 text-green-800 border-green-300'
            }
          ];
        })().map((card, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${card.color}`}>
            <div className="flex items-center">
              <div className="text-3xl mr-4">{card.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Job Progress Over Time */}
        <LineChartComponent
          data={filteredData.timeSeriesData}
          dataKeys={[
            { key: "jobsStarted", color: colors.warning, name: "Jobs Started" },
            {
              key: "jobsCompleted",
              color: colors.success,
              name: "Jobs Completed",
            },
          ]}
          xAxisKey="date"
          title="Job Progress Over Time"
          height={300}
          maxDataPoints={2000}
          showArea={true}
        />

        {/* Step Completion Status */}
        <BarChartComponent
  data={Object.entries(filteredData.stepCompletionStats)
    .filter(([step]) => !(step === "Paper Store" && filteredData.stepCompletionStats["PaperStore"]))
    .map(([step, stats]) => ({
      step,
      completed: stats.completed,
      inProgress: stats.inProgress,
      planned: stats.planned,
    }))
  }
  dataKeys={[
    { key: "completed", color: colors.success, name: "Completed" },
    { key: "inProgress", color: colors.warning, name: "In Progress" },
    { key: "planned", color: colors.gray, name: "Planned" },
  ]}
  xAxisKey="step"
  title="Step Completion Status"
  height={300}
  maxDataPoints={500}
  stacked={true}
  stepCompletionStats={filteredData.stepCompletionStats} // Add this line
/>

      </div>
      {/* <DateFilterComponent
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        className="mb-4"
      /> */}
      {/* Machine Utilization */}
      {/* <BarChartComponent
  data={Object.entries(filteredData.machineUtilization).map(
    ([machine, stats]) => ({
      machine,
      available: stats.available,
      inUse: stats.inUse,
     
    })
  )}
  dataKeys={[
    { key: "available", color: colors.success, name: "Available" },
    { key: "inUse", color: colors.warning, name: "In Use" },
  ]}
  xAxisKey="machine"
  title="Machine Utilization"
  height={300}
  maxDataPoints={300}
  className="mb-8"
  showDateFilter={true}
/> */}

<MachineUtilizationDashboard
  machineData={filteredData.machineUtilization}
  className="mb-8"
/>


      {/* Step-wise Progress Chart */}
      {/* <LineChartComponent
        data={filteredData.timeSeriesData}
        dataKeys={[
          { key: 'totalSteps', color: colors.primary, name: 'Total Steps' },
          { key: 'completedSteps', color: colors.success, name: 'Completed Steps' }
        ]}
        xAxisKey="date"
        title="Step-wise Progress"
        height={400}
        maxDataPoints={3000}
        showArea={true}
        className="mb-8"
      /> */}

      {/* Advanced Data Visualization for Large Datasets */}
      {/* <AdvancedDataChart
        data={filteredData.jobPlans.flatMap(jobPlan => 
          jobPlan.steps.map(step => ({
            date: step.startDate || step.createdAt,
            stepName: step.stepName,
            status: step.status,
            user: step.user,
            machineType: step.machineDetails?.[0]?.machineType || 'Not assigned',
            stepId: step.id,
            jobNo: jobPlan.nrcJobNo,
            demand: jobPlan.jobDemand
          }))
        )}
        dataKeys={[
          { key: 'stepId', color: colors.primary, name: 'Step ID' },
          { key: 'status', color: colors.secondary, name: 'Status' },
          { key: 'demand', color: colors.accent, name: 'Demand Level' }
        ]}
        xAxisKey="date"
        title="Advanced Step Analysis (Large Dataset Capable)"
        chartType="line"
        height={450}
        maxDataPoints={5000}
        enableVirtualization={true}
        enableFiltering={true}
        enableSearch={true}
        className="mb-8"
      /> */}

      {/* {console.log(filteredData.stepCompletionStats)} */}

      {/* Detailed Step Information */}
      {/* <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Detailed Step Information
        </h3>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {Object.entries(filteredData.stepCompletionStats)
    .map(([stepName, stats]) => {
      const stepJobs = filteredData.jobPlans.filter((jobPlan) =>
        jobPlan.steps.some(
          (step) => step.stepName === stepName && step.stepDetails
        )
      );

      return (
        <div
          key={stepName}
          className="border border-gray-200 rounded-lg p-4"
        >
          <h4 className="font-semibold text-gray-700 mb-3">
            {stepName}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">
                {stats.completed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                In Progress:
              </span>
              <span className="font-medium text-yellow-600">
                {stats.inProgress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Planned:</span>
              <span className="font-medium text-gray-600">
                {stats.planned}
              </span>
            </div>
            {stepJobs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Recent Jobs with Details:
                </p>
                <div className="space-y-1">
                  {stepJobs.slice(0, 3).map((jobPlan) => {
                    const step = jobPlan.steps.find(
                      (s) => s.stepName === stepName
                    );
                    const details = step?.stepDetails;

                    if (!details) return null;

                    return (
                      <div
                        key={jobPlan.jobPlanId}
                        className="text-xs bg-gray-50 p-2 rounded"
                      >
                        <div className="font-medium text-gray-700">
                          {jobPlan.nrcJobNo}
                        </div>
                        <div className="text-gray-500">
                          {details.quantity &&
                            `Qty: ${details.quantity}`}
                          {details.operatorName &&
                            ` | Operator: ${details.operatorName}`}
                          {details.date &&
                            ` | Date: ${new Date(
                              details.date
                            ).toLocaleDateString()}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })}
</div>

      </div> */}

      {/* Job Plans Table */}
      <JobPlansTable
        jobPlans={filteredData.jobPlans}
        onViewDetails={(jobPlan) => console.log("Viewing job plan:", jobPlan)}
        className="mb-8"
      />

      {/* Job Demand Distribution Pie Chart */}
      {/* Quality Check and Customer Insights Section */}
<div className="flex flex-col lg:flex-row gap-8 mb-8">
  {/* Quality Check Cards */}
   <div className="flex-1">
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Quality Control Overview
      </h3>
      
      {/* Quality Stats Cards */}
     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm font-medium text-green-700">Accepted</p>
              <p className="text-xl font-bold text-green-800">230</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">❌</div>
            <div>
              <p className="text-sm font-medium text-red-700">Rejected</p>
              <p className="text-xl font-bold text-red-800">20</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📊</div>
            <div>
              <p className="text-sm font-medium text-blue-700">Success Rate</p>
              <p className="text-xl font-bold text-blue-800">92%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reasons */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Rejection Reasons
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">Damaged Packaging</span>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">8</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">Print Smudges</span>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">5</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">Wrong Dimensions</span>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">7</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Customer Insights */}
 <div className="flex-1">
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Customer Insights
      </h3>
      
      {/* Customer Metrics */}
      <div className="space-y-4 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🔄</div>
            <div>
              <p className="text-sm font-medium text-purple-700">Retention Rate</p>
              <p className="text-xl font-bold text-purple-800">85%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👥</div>
            <div>
              <p className="text-sm font-medium text-indigo-700">New Customers</p>
              <p className="text-xl font-bold text-indigo-800">23</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customer Segments */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Top Customer Segments
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">🍭 Sweets Shops</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '40%'}}></div>
              </div>
              <span className="text-xs text-gray-600 font-medium">40%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">👕 Clothing Retailers</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '35%'}}></div>
              </div>
              <span className="text-xs text-gray-600 font-medium">35%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">📱 Electronics Stores</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
              </div>
              <span className="text-xs text-gray-600 font-medium">15%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">🪑 Furniture Shops</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '10%'}}></div>
              </div>
              <span className="text-xs text-gray-600 font-medium">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Job Demand Distribution Pie Chart */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  <PieChartComponent
    data={[
      {
        name: "Low Demand",
        value: filteredData.jobPlans.filter(
          (jp) => jp.jobDemand === "low"
        ).length,
        color: colors.success,
      },
      {
        name: "Medium Demand", 
        value: filteredData.jobPlans.filter(
          (jp) => jp.jobDemand === "medium"
        ).length,
        color: colors.warning,
      },
      {
        name: "High Demand",
        value: filteredData.jobPlans.filter(
          (jp) => jp.jobDemand === "high"
        ).length,
        color: colors.danger,
      },
    ]}
    title="Job Demand Distribution"
    height={300}
    maxDataPoints={50}
    showPercentage={true}
    showValues={true}
  />

  <PieChartComponent
    data={[
      {
        name: "Completed",
        value: filteredData.completedJobs,
        color: colors.success,
      },
      {
        name: "In Progress",
        value: filteredData.inProgressJobs,
        color: colors.warning,
      },
      {
        name: "Planned",
        value: filteredData.plannedJobs,
        color: colors.gray,
      },
    ]}
    title="Job Status Distribution"
    height={300}
    maxDataPoints={50}
    showPercentage={true}
    showValues={true}
  />
</div>

    </div>
  );
};

export default AdminDashboard;
