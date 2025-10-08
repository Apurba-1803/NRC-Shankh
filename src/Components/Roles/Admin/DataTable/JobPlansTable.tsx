import React, { useState } from "react";
import {
  Eye,
  Search,
  Filter as FilterIcon,
  Briefcase,
  Package,
  X,
  ChevronRight,
} from "lucide-react";

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
  stepDetails?: {
    data?: {
      status?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  steps: JobPlanStep[];
}

interface JobDetails {
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
  topFaceGSM: string;
  flutingGSM: string;
  bottomLinerGSM: string;
  boardSize: string;
  noUps: string;
  artworkReceivedDate: string;
  artworkApprovedDate: string;
  shadeCardApprovalDate: string;
  jobDemand: string;
  imageURL: string | null;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  customer: string;
  poDate: string;
  deliveryDate: string;
  totalPOQuantity: number;
  dispatchQuantity: number;
  pendingQuantity: number;
  plant: string;
  unit: string;
  status: string;
  boardSize: string;
  fluteType: string;
}

interface JobDetailsWithPO {
  jobDetails: JobDetails | null;
  purchaseOrderDetails: PurchaseOrder[];
  poJobPlannings: any[];
}

interface JobPlansTableProps {
  jobPlans: JobPlan[];
  onViewDetails: (jobPlan: JobPlan) => void;
  className?: string;
}

const JobPlansTable: React.FC<JobPlansTableProps> = ({
  jobPlans,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [demandFilter, setDemandFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "inProgress" | "planned"
  >("all");
  const [selectedJobPlan, setSelectedJobPlan] = useState<JobPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobDetailsWithPO, setJobDetailsWithPO] =
    useState<JobDetailsWithPO | null>(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const [jobDetailsError, setJobDetailsError] = useState<string | null>(null);
  const [activeJobTab, setActiveJobTab] = useState<"job" | "po">("job");

  const fetchJobWithPODetails = async (nrcJobNo: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Authentication token not found");
    }

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
      throw error;
    }
    return {
      jobDetails: null,
      purchaseOrderDetails: [],
      poJobPlannings: [],
    };
  };

  const handleJobCardClick = async (nrcJobNo: string) => {
    setLoadingJobDetails(true);
    setJobDetailsError(null);
    setActiveJobTab("job");

    try {
      const details = await fetchJobWithPODetails(nrcJobNo);
      setJobDetailsWithPO(details);
    } catch (error) {
      setJobDetailsError("Failed to fetch job details. Please try again.");
      console.error("Error fetching job details:", error);
    } finally {
      setLoadingJobDetails(false);
    }
  };

  const handleViewDetails = (jobPlan: JobPlan) => {
    setSelectedJobPlan(jobPlan);
    setIsModalOpen(true);
    setJobDetailsWithPO(null);
  };

  // Filter job plans based on search and filters
  const filteredJobPlans = jobPlans.filter((jobPlan) => {
    const matchesSearch = jobPlan.nrcJobNo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDemand =
      demandFilter === "all" || jobPlan.jobDemand === demandFilter;

    let matchesStatus = true;
    if (statusFilter !== "all") {
      const hasInProgress = jobPlan.steps.some(
        (step) => step.status === "start"
      );
      const allCompleted = jobPlan.steps.every(
        (step) => step.status === "stop"
      );

      if (statusFilter === "completed") matchesStatus = allCompleted;
      else if (statusFilter === "inProgress") matchesStatus = hasInProgress;
      else if (statusFilter === "planned")
        matchesStatus = !hasInProgress && !allCompleted;
    }

    return matchesSearch && matchesDemand && matchesStatus;
  });

  const getJobStatus = (jobPlan: JobPlan) => {
    const hasInProgress = jobPlan.steps.some((step) => step.status === "start");
    const allCompleted = jobPlan.steps.every((step) => step.status === "stop");

    if (allCompleted)
      return { text: "Completed", color: "bg-green-100 text-green-800" };
    if (hasInProgress)
      return { text: "In Progress", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Planned", color: "bg-gray-100 text-gray-800" };
  };

  const getProgressPercentage = (jobPlan: JobPlan) => {
    const completedSteps = jobPlan.steps.filter(
      (step) => step.status === "stop"
    ).length;
    const totalSteps = jobPlan.steps.length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  const getStatusStyle = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";

    switch (status) {
      case "stop":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "start":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "planned":
        return `${baseClasses} bg-gray-100 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const formatStepName = (stepName: string): string => {
    return stepName
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .trim();
  };

  console.log("selectedJobPlan:", selectedJobPlan);
  console.log("jobDetailsWithPO:", jobDetailsWithPO);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
          Job Cards Overview
        </h3>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search job plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] w-full sm:w-64"
            />
          </div>

          {/* Demand Filter */}
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
          >
            <option value="all">All Demands</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="inProgress">In Progress</option>
            <option value="planned">Planned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobPlans.map((jobPlan) => {
              const status = getJobStatus(jobPlan);
              const progressPercentage = getProgressPercentage(jobPlan);

              return (
                <tr key={jobPlan.jobPlanId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {jobPlan.nrcJobNo}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {jobPlan.jobPlanId}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        jobPlan.jobDemand === "high"
                          ? "bg-red-100 text-red-800"
                          : jobPlan.jobDemand === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {jobPlan.jobDemand === "medium"
                        ? "Regular"
                        : jobPlan.jobDemand}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-[#00AEEF] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {
                        jobPlan.steps.filter((step) => step.status === "stop")
                          .length
                      }
                      /{jobPlan.steps.length} steps
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(jobPlan.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(jobPlan)}
                      className="text-[#00AEEF] hover:text-[#0099cc] transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Eye size={16} />
                      <span>View Steps</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredJobPlans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FilterIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No job plans found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Job Steps Modal */}
      {isModalOpen && selectedJobPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h2 className="text-xl font-semibold mb-4">
              Job Card Steps - {selectedJobPlan.nrcJobNo}
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                {
                  label: "Job Card No",
                  value: selectedJobPlan.nrcJobNo,
                  color: "blue",
                  clickable: true,
                },
                {
                  label: "Job Card ID",
                  value: selectedJobPlan.jobPlanId,
                  color: "green",
                },
                {
                  label: "Demand",
                  value:
                    selectedJobPlan.jobDemand === "medium"
                      ? "Regular"
                      : selectedJobPlan.jobDemand,
                  color: "purple",
                },
                {
                  label: "Created",
                  value: new Date(selectedJobPlan.createdAt).toLocaleString(),
                  color: "orange",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col p-3 rounded-md shadow-sm border-l-4 border-${item.color}-500 bg-white`}
                >
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                    {item.label}
                  </span>
                  {item.clickable ? (
                    <button
                      onClick={() =>
                        handleJobCardClick(selectedJobPlan.nrcJobNo)
                      }
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer mt-0.5 text-left flex items-center"
                    >
                      {item.value || "-"}
                      <ChevronRight size={14} className="ml-1" />
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900 mt-0.5">
                      {item.value || "-"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Steps */}
            <h3 className="text-lg font-medium mb-2">Steps</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-50 to-green-100 sticky top-0">
                  <tr>
                    {[
                      "Step No",
                      "Step Name",
                      "Status",
                      "Machine",
                      "Capacity",
                      "Start Date",
                      "End Date",
                      "User",
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 uppercase tracking-wide"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedJobPlan.steps.map((step) => (
                    <tr
                      key={step.id}
                      className="hover:bg-indigo-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {step.stepNo}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatStepName(step.stepName)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                            step.stepDetails?.data?.status || step.status
                          )}`}
                        >
                          {(step.stepDetails?.data?.status || step.status)
                            .charAt(0)
                            .toUpperCase() +
                            (step.stepDetails?.data?.status || step.status)
                              .slice(1)
                              .replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {step.machineDetails?.[0]?.machineType || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {step.machineDetails?.[0]?.machine?.capacity || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(step.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(step.endDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {step.user || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Job Details and PO Modal */}
      {(jobDetailsWithPO || loadingJobDetails) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl p-6 relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => {
                setJobDetailsWithPO(null);
                setLoadingJobDetails(false);
                setJobDetailsError(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <h2 className="text-xl font-semibold">
                Job & Purchase Order Details
              </h2>
              {jobDetailsWithPO?.jobDetails && (
                <span className="text-lg text-gray-600">
                  - {jobDetailsWithPO.jobDetails.nrcJobNo}
                </span>
              )}
            </div>

            {/* Loading State */}
            {loadingJobDetails && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Loading job details...</p>
              </div>
            )}

            {/* Error State */}
            {jobDetailsError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {jobDetailsError}
              </div>
            )}

            {/* Tab Navigation */}
            {jobDetailsWithPO?.jobDetails && !loadingJobDetails && (
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveJobTab("job")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeJobTab === "job"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Briefcase size={16} />
                      <span>Job Details</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveJobTab("po")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeJobTab === "po"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Package size={16} />
                      <span>
                        Purchase Orders (
                        {jobDetailsWithPO?.purchaseOrderDetails?.length || 0})
                      </span>
                    </div>
                  </button>
                </nav>
              </div>
            )}

            {/* Job Details Tab */}
            {activeJobTab === "job" &&
              jobDetailsWithPO?.jobDetails &&
              !loadingJobDetails && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Information */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">
                        Basic Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Style:</span>{" "}
                          {jobDetailsWithPO.jobDetails.styleItemSKU}
                        </div>
                        <div>
                          <span className="font-medium">Customer:</span>{" "}
                          {jobDetailsWithPO.jobDetails.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          {jobDetailsWithPO.jobDetails.status}
                        </div>
                        <div>
                          <span className="font-medium">Demand:</span>{" "}
                          {jobDetailsWithPO.jobDetails.jobDemand === "medium"
                            ? "Regular"
                            : jobDetailsWithPO.jobDetails.jobDemand}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800 mb-3">
                        Pricing
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Latest Rate:</span> ₹
                          {jobDetailsWithPO.jobDetails.latestRate}
                        </div>
                        <div>
                          <span className="font-medium">Previous Rate:</span> ₹
                          {jobDetailsWithPO.jobDetails.preRate}
                        </div>
                        <div>
                          <span className="font-medium">Die Punch Code:</span>{" "}
                          {jobDetailsWithPO.jobDetails.diePunchCode}
                        </div>
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">
                        Dimensions
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Box Dimensions:</span>{" "}
                          {jobDetailsWithPO.jobDetails.boxDimensions}
                        </div>
                        <div>
                          <span className="font-medium">Board Size:</span>{" "}
                          {jobDetailsWithPO.jobDetails.boardSize}
                        </div>
                        <div>
                          <span className="font-medium">No of Ups:</span>{" "}
                          {jobDetailsWithPO.jobDetails.noUps}
                        </div>
                      </div>
                    </div>

                    {/* Material Specifications */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-orange-800 mb-3">
                        Material Specs
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Flute Type:</span>{" "}
                          {jobDetailsWithPO.jobDetails.fluteType}
                        </div>
                        <div>
                          <span className="font-medium">Board Category:</span>{" "}
                          {jobDetailsWithPO.jobDetails.boardCategory}
                        </div>
                        <div>
                          <span className="font-medium">Top Face GSM:</span>{" "}
                          {jobDetailsWithPO.jobDetails.topFaceGSM}
                        </div>
                        <div>
                          <span className="font-medium">Fluting GSM:</span>{" "}
                          {jobDetailsWithPO.jobDetails.flutingGSM}
                        </div>
                        <div>
                          <span className="font-medium">Bottom Liner GSM:</span>{" "}
                          {jobDetailsWithPO.jobDetails.bottomLinerGSM}
                        </div>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">
                        Color Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">No of Colors:</span>{" "}
                          {jobDetailsWithPO.jobDetails.noOfColor}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                        Important Dates
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Artwork Received:</span>{" "}
                          {new Date(
                            jobDetailsWithPO.jobDetails.artworkReceivedDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Artwork Approved:</span>{" "}
                          {new Date(
                            jobDetailsWithPO.jobDetails.artworkApprovedDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">
                            Shade Card Approval:
                          </span>{" "}
                          {new Date(
                            jobDetailsWithPO.jobDetails.shadeCardApprovalDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Purchase Orders Tab */}
            {activeJobTab === "po" &&
              jobDetailsWithPO &&
              !loadingJobDetails && (
                <div className="space-y-6">
                  {jobDetailsWithPO.purchaseOrderDetails.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No purchase orders found for this job.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {jobDetailsWithPO.purchaseOrderDetails.map((po) => (
                        <div
                          key={po.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              PO #{po.poNumber}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                po.status === "created"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {po.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Order Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">Customer:</span>{" "}
                                  {po.customer}
                                </div>
                                <div>
                                  <span className="font-medium">Plant:</span>{" "}
                                  {po.plant}
                                </div>
                                <div>
                                  <span className="font-medium">Unit:</span>{" "}
                                  {po.unit}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Quantities
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Total PO Qty:
                                  </span>{" "}
                                  {po.totalPOQuantity?.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Dispatch Qty:
                                  </span>{" "}
                                  {po.dispatchQuantity?.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Pending Qty:
                                  </span>{" "}
                                  {po.pendingQuantity?.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">
                                Dates
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">PO Date:</span>{" "}
                                  {new Date(po.poDate).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Delivery Date:
                                  </span>{" "}
                                  {new Date(
                                    po.deliveryDate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPlansTable;
