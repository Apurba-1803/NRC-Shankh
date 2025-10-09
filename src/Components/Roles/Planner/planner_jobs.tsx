// src/Components/Roles/Planner/planner_jobs.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Upload,
  Filter,
  X,
  Settings,
  Download,
} from "lucide-react";
import POdetailCard from "./jobCard/POdetailCard";
import PODetailModal from "./jobCard/PODetailModal";
import { supabase } from "../../../lib/supabaseClient";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { BulkJobPlanningModal } from "./modal/BulkJobPlanning";
import { Grid, List } from "lucide-react";

interface PurchaseOrder {
  id: number;
  boardSize: string | null;
  customer: string;
  deliveryDate: string;
  dieCode: number | null;
  dispatchDate: string | null;
  dispatchQuantity: number | null;
  fluteType: string | null;
  jockeyMonth: string | null;
  noOfUps: number | null;
  nrcDeliveryDate: string | null;
  noOfSheets: number | null;
  poDate: string;
  poNumber: string;
  pendingQuantity: number | null;
  pendingValidity: number | null;
  plant: string | null;
  shadeCardApprovalDate: string | null;
  sharedCardDiffDate: number | null;
  srNo: number | null;
  style: string | null;
  totalPOQuantity: number | null;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobNrcJobNo: string | null;
  userId: string | null;
  job: {
    nrcJobNo: string;
    customerName: string;
    styleItemSKU: string;
  } | null;
  user: any | null;
  // Extended fields from job data
  boxDimensions: string | null;
  processColors?: string;
  noOfColor?: string | null;
  jobBoardSize: string | null;
  // Job planning fields
  steps?: any[];
  jobSteps?: any[];
  hasJobPlan?: boolean;
  jobDemand?: string;
  machineId?: string | null;
  jobPlanId?: number;
  jobPlanCreatedAt?: string;
  jobPlanUpdatedAt?: string;
}

interface Job {
  id: number;
  nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  fluteType: string | null;
  status: "ACTIVE" | "INACTIVE";
  latestRate: number | null;
  preRate: number | null;
  length: number | null;
  width: number | null;
  hasJobPlan: boolean;
  height: number | null;
  boxDimensions: string;
  diePunchCode: number | null;
  boardCategory: string | null;
  noOfColor: string | null;
  processColors: string | null;
  specialColor1: string | null;
  specialColor2: string | null;
  specialColor3: string | null;
  specialColor4: string | null;
  overPrintFinishing: string | null;
  topFaceGSM: string | null;
  flutingGSM: string | null;
  bottomLinerGSM: string | null;
  decalBoardX: string | null;
  lengthBoardY: string | null;
  boardSize: string;
  noUps: string | null;
  artworkReceivedDate: string | null;
  artworkApprovedDate: string | null;
  shadeCardApprovalDate: string | null;
  srNo: number | null;
  jobDemand: "high" | "medium" | "low" | null;
  imageURL: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  machineId: string | null;
  poNumber: string | null;
  unit: string | null;
  plant: string | null;
  totalPOQuantity: number | null;
  dispatchQuantity: number | null;
  pendingQuantity: number | null;
  noOfSheets: number | null;
  poDate: string | null;
  deliveryDate: string | null;
  dispatchDate: string | null;
  nrcDeliveryDate: string | null;
  jobSteps: any[] | null;
}

interface FilterState {
  noOfColors: string[];
  boardSizes: string[];
  deliveryDateFrom: string;
  deliveryDateTo: string;
}

const PlannerJobs: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message] = useState<string | null>(null);

  // State for PO data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([]);

  // State for job search
  const [searchedJob, setSearchedJob] = useState<Job | null>(null);
  const [jobOptions, setJobOptions] = useState<Job[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    noOfColors: [],
    boardSizes: [],
    deliveryDateFrom: "",
    deliveryDateTo: "",
  });

  // Available filter options (extracted from data)
  const [availableNoOfColors, setAvailableNoOfColors] = useState<string[]>([]);
  const [availableBoardSizes, setAvailableBoardSizes] = useState<string[]>([]);
  const [showBulkPlanningModal, setShowBulkPlanningModal] = useState(false);
  const [noOfColorsSearch, setNoOfColorsSearch] = useState("");
  const [dimensionsSearch, setDimensionsSearch] = useState("");

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Add this helper function for list view
  const getStatusColor = (status: string) => {
    switch (status) {
      case "artwork_pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "po_pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "more_info_pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper function to check job completion status
  const checkPOCompletionStatus = (
    po: any
  ): "artwork_pending" | "po_pending" | "more_info_pending" | "completed" => {
    console.log("po in check po completion function", po);

    // Check if job plan exists using hasJobPlan flag, steps, or jobSteps
    const hasJobPlan =
      po.hasJobPlan ||
      (po.steps && po.steps.length > 0) ||
      (po.jobSteps && po.jobSteps.length > 0);

    if (hasJobPlan) {
      return "completed";
    }

    if (!po.shadeCardApprovalDate) {
      return "artwork_pending";
    }

    if (!po.poNumber || !po.poDate) {
      return "po_pending";
    }

    return "more_info_pending";
  };

  // Enhanced function to merge PO data with job planning AND job details
  const mergePOWithJobPlanningAndJobs = (
    purchaseOrders: any[],
    jobPlannings: any[],
    jobs: any[]
  ) => {
    return purchaseOrders.map((po) => {
      // Debug logging for the specific PO
      if (
        po.jobNrcJobNo === "NON-1 KG X 10 PKT-5 PLAY" ||
        po.poNumber === "test1234" ||
        po.poNumber === "12345" ||
        po.id === 3558
      ) {
        console.log("🔍 DEBUGGING PO:", {
          poNumber: po.poNumber,
          jobNrcJobNo: po.jobNrcJobNo,
          nrcJobNo: po.nrcJobNo,
          customer: po.customer,
        });
        console.log(
          "🔍 Available job plannings:",
          jobPlannings.map((jp) => ({
            nrcJobNo: jp.nrcJobNo,
            purchaseOrderId: jp.purchaseOrderId,
          }))
        );
      }

      // Find matching job planning by nrcJobNo (prioritize nrcJobNo matching)
      const matchingJobPlan = jobPlannings.find((jp) => {
        const matchesJobNrcJobNo = jp.nrcJobNo === po.jobNrcJobNo;
        const matchesNrcJobNo = jp.nrcJobNo === po.nrcJobNo;
        const matchesPurchaseOrderId = jp.purchaseOrderId === po.id;

        if (
          po.jobNrcJobNo === "NON-1 KG X 10 PKT-5 PLAY" ||
          po.poNumber === "12345" ||
          po.id === 3558
        ) {
          console.log("🔍 Job Planning Match Check:", {
            jpNrcJobNo: jp.nrcJobNo,
            poJobNrcJobNo: po.jobNrcJobNo,
            poNrcJobNo: po.nrcJobNo,
            jpPurchaseOrderId: jp.purchaseOrderId,
            poId: po.id,
            matchesJobNrcJobNo,
            matchesNrcJobNo,
            matchesPurchaseOrderId,
            finalMatch: matchesJobNrcJobNo || matchesNrcJobNo,
          });
        }

        // Prioritize nrcJobNo matching over purchaseOrderId matching
        // This handles cases where purchaseOrderId is null but nrcJobNo matches
        return matchesJobNrcJobNo || matchesNrcJobNo;
      });

      // Find matching job details by nrcJobNo
      const matchingJob = jobs.find(
        (job) => job.nrcJobNo === po.jobNrcJobNo || job.nrcJobNo === po.nrcJobNo
      );

      if (
        po.jobNrcJobNo === "NON-1 KG X 10 PKT-5 PLAY" ||
        po.poNumber === "test1234" ||
        po.poNumber === "12345" ||
        po.id === 3558
      ) {
        console.log("🔍 Matching job plan:", matchingJobPlan);
        console.log("🔍 Matching job plan steps:", matchingJobPlan?.steps);
        console.log("🔍 Matching job:", matchingJob);
        console.log("🔍 Has job plan:", !!matchingJobPlan);
        console.log("🔍 Job plan jobDemand:", matchingJobPlan?.jobDemand);
      }

      // Merge all the data
      return {
        ...po,
        // Add job planning fields
        jobDemand: matchingJobPlan?.jobDemand || null,
        machineId:
          matchingJobPlan?.steps?.[0]?.machineDetails?.[0]?.machineId ||
          matchingJobPlan?.steps?.[1]?.machineDetails?.[0]?.machineId ||
          null,
        jobSteps: matchingJobPlan?.steps || [],
        jobPlanId: matchingJobPlan?.jobPlanId || null,
        jobPlanCreatedAt: matchingJobPlan?.createdAt || null,
        jobPlanUpdatedAt: matchingJobPlan?.updatedAt || null,
        hasJobPlan: !!matchingJobPlan,

        // Add job details fields for display and filtering
        boxDimensions: matchingJob?.boxDimensions || null,
        processColors: matchingJob?.processColors || null,
        jobBoardSize: matchingJob?.boardSize || null,
        // Additional job fields that might be useful
        fluteType: matchingJob?.fluteType || po.fluteType,
        noOfColor: matchingJob?.noOfColor || null,
        overPrintFinishing: matchingJob?.overPrintFinishing || null,
        topFaceGSM: matchingJob?.topFaceGSM || null,
        flutingGSM: matchingJob?.flutingGSM || null,
        bottomLinerGSM: matchingJob?.bottomLinerGSM || null,
      };
    });
  };

  // Extract unique values for filter options
  // Extract unique values for filter options (only from POs that need job planning)
  const extractFilterOptions = (purchaseOrders: PurchaseOrder[]) => {
    const colors = new Set<string>();
    const boardSizes = new Set<string>();

    purchaseOrders.forEach((po) => {
      // ADDED: Only extract options from POs that need more information
      const completionStatus = checkPOCompletionStatus(po);
      if (completionStatus !== "more_info_pending") {
        return; // Skip this PO if it doesn't need job planning
      }

      // Extract number of colors from merged job data
      // If no job data exists for the PO, still include "0" as a selectable option
      if (po.noOfColor !== undefined && po.noOfColor !== null) {
        colors.add(String(po.noOfColor));
      } else {
        colors.add("0");
      }

      // Extract board sizes/dimensions
      if (po.jobBoardSize) boardSizes.add(po.jobBoardSize);
    });

    setAvailableNoOfColors(
      Array.from(colors).filter(
        (color) => color !== undefined && color !== null
      )
    );
    setAvailableBoardSizes(
      Array.from(boardSizes).filter((size) => size && size.trim())
    );
  };

  // Apply filters to purchase orders
  // Apply filters to purchase orders
  const applyFilters = (pos: PurchaseOrder[]) => {
    return pos.filter((po) => {
      // Check if any filters are active
      const hasActiveFilters =
        filters.noOfColors.length > 0 ||
        filters.boardSizes.length > 0 ||
        filters.deliveryDateFrom ||
        filters.deliveryDateTo;

      // ADDED: If any filters are applied, only show POs that need more information (job planning)
      if (hasActiveFilters) {
        const completionStatus = checkPOCompletionStatus(po);
        if (completionStatus !== "more_info_pending") {
          return false; // Filter out completed, artwork_pending, and po_pending when filters are active
        }
      }

      // Number of colors filter
      if (filters.noOfColors.length > 0) {
        const poNoOfColor =
          po.noOfColor !== undefined && po.noOfColor !== null
            ? String(po.noOfColor)
            : "0";

        const hasMatchingColor = filters.noOfColors.includes(poNoOfColor);

        if (!hasMatchingColor) return false;
      }

      // Board size/dimensions filter
      if (filters.boardSizes.length > 0) {
        const poBoardSize = po.jobBoardSize;
        if (
          !poBoardSize ||
          !filters.boardSizes.some((size) =>
            poBoardSize.toLowerCase().includes(size.toLowerCase())
          )
        ) {
          return false;
        }
      }

      // Delivery date filter
      if (filters.deliveryDateFrom || filters.deliveryDateTo) {
        const deliveryDate = po.deliveryDate;
        if (!deliveryDate) return false;

        const poDate = new Date(deliveryDate);

        if (filters.deliveryDateFrom) {
          const fromDate = new Date(filters.deliveryDateFrom);
          if (poDate < fromDate) return false;
        }

        if (filters.deliveryDateTo) {
          const toDate = new Date(filters.deliveryDateTo);
          if (poDate > toDate) return false;
        }
      }

      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Handle color filter toggle
  const toggleNoOfColorFilter = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      noOfColors: prev.noOfColors.includes(color)
        ? prev.noOfColors.filter((c) => c !== color)
        : [...prev.noOfColors, color],
    }));
  };

  // Handle board size filter toggle
  const toggleBoardSizeFilter = (boardSize: string) => {
    setFilters((prev) => ({
      ...prev,
      boardSizes: prev.boardSizes.includes(boardSize)
        ? prev.boardSizes.filter((bs) => bs !== boardSize)
        : [...prev.boardSizes, boardSize],
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      noOfColors: [],
      boardSizes: [],
      deliveryDateFrom: "",
      deliveryDateTo: "",
    });
  };

  // Count active filters
  const activeFilterCount =
    filters.noOfColors.length +
    filters.boardSizes.length +
    (filters.deliveryDateFrom ? 1 : 0) +
    (filters.deliveryDateTo ? 1 : 0);

  // Apply filters whenever filters change or purchase orders change
  useEffect(() => {
    let basePOs = purchaseOrders;

    // If there's a searched job, filter by that first
    if (searchedJob) {
      basePOs = purchaseOrders.filter(
        (po) => po.jobNrcJobNo === searchedJob.nrcJobNo
      );
    }

    // Apply additional filters
    const filtered = applyFilters(basePOs);
    setFilteredPOs(filtered);
  }, [filters, purchaseOrders, searchedJob]);

  const handleBulkJobPlanning = async (jobPlanningData: any) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication token not found.");

      // 🔥 FIXED: Now receives individual job planning data (same as single job planning)
      // Just forward it to the API
      console.log(
        `Creating job plan for ${jobPlanningData.nrcJobNo}`,
        jobPlanningData
      );

      const response = await fetch(
        "https://nrprod.nrcontainers.com/api/job-planning/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(jobPlanningData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create job plan for ${jobPlanningData.nrcJobNo}: ${
            errorData.message || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log("Job plan created successfully:", result);

      // 🔥 FIXED: Update machine statuses to busy (extract from machineDetails)
      const allMachines: any[] = [];
      jobPlanningData.steps?.forEach((step: any) => {
        if (step.machineDetails && Array.isArray(step.machineDetails)) {
          step.machineDetails.forEach((md: any) => {
            if (md.id) {
              allMachines.push(md);
            }
          });
        }
      });

      // Update machine statuses
      if (allMachines.length > 0) {
        const machineUpdatePromises = allMachines.map(async (machine: any) => {
          try {
            const response = await fetch(
              `https://nrprod.nrcontainers.com/api/machines/${machine.id}/status`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ status: "busy" }),
              }
            );

            if (!response.ok) {
              console.warn(`Failed to update machine ${machine.id} status`);
            } else {
              console.log(`✅ Machine ${machine.id} status updated to busy`);
            }
          } catch (error) {
            console.warn(`Error updating machine ${machine.id} status:`, error);
          }
        });

        await Promise.all(machineUpdatePromises);
      }

      // Note: Modal close and refresh are handled by BulkJobPlanningModal after all POs are processed
    } catch (err) {
      console.error("Job planning error:", err);
      throw err; // Re-throw to let BulkJobPlanningModal handle the error
    }
  };

  // Enhanced function to fetch all three APIs and merge data
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch all three APIs simultaneously
      const [poResponse, jobPlanResponse, jobsResponse] = await Promise.all([
        fetch("https://nrprod.nrcontainers.com/api/purchase-orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch("https://nrprod.nrcontainers.com/api/job-planning/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch("https://nrprod.nrcontainers.com/api/jobs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      // Check responses
      if (!poResponse.ok) {
        const errorData = await poResponse.json();
        throw new Error(
          errorData.message ||
            `Failed to fetch purchase orders: ${poResponse.status}`
        );
      }

      if (!jobPlanResponse.ok) {
        console.warn(
          "Job planning fetch failed, continuing without job planning data"
        );
      }

      if (!jobsResponse.ok) {
        console.warn("Jobs fetch failed, continuing without job details");
      }

      // Parse responses
      const poData = await poResponse.json();
      const jobPlanData = jobPlanResponse.ok
        ? await jobPlanResponse.json()
        : { success: true, data: [] };
      const jobsData = jobsResponse.ok
        ? await jobsResponse.json()
        : { success: true, data: [] };

      if (poData.success && Array.isArray(poData.data)) {
        // Merge all three data sources
        const mergedData = mergePOWithJobPlanningAndJobs(
          poData.data,
          jobPlanData.data || [],
          jobsData.data || []
        );

        setPurchaseOrders(mergedData);
        setFilteredPOs(mergedData);

        // Extract filter options from merged data
        extractFilterOptions(mergedData);

        console.log("✅ Merged PO, Job Planning, and Job data:", mergedData);
        console.log("🔍 Raw Job Planning Data:", jobPlanData.data);
        console.log("🔍 Raw Jobs Data:", jobsData.data);
      } else {
        setError("Unexpected API response format or data is not an array.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Fetch Purchase Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // debounce API call
    const timeout = setTimeout(() => {
      if (value.trim()) {
        searchJob(value);
      } else {
        setJobOptions([]);
        setSearchedJob(null);
      }
    }, 300);

    setTypingTimeout(timeout);
  };

  // modified searchJob (takes term directly instead of using searchTerm state)
  const searchJob = async (term: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const response = await fetch("https://nrprod.nrcontainers.com/api/jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const activeJobs = data.data.filter((job: Job) =>
          job.nrcJobNo.toLowerCase().includes(term.toLowerCase())
        );
        setJobOptions(activeJobs);
      }
    } catch (err) {
      console.error("Search Job Error:", err);
      setJobOptions([]);
    }
  };

  // Handle PO card click
  const handlePOClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    // Modal will be opened by setting selectedPO
  };

  // Handle Add PO button click
  const handleAddPO = () => {
    navigate("/dashboard/planner/initiate-job/new");
  };

  // Handle bulk download of PO data
  const handleBulkDownload = async () => {
    try {
      setLoading(true);

      // Fetch all PO data from the database
      const { data: poData, error } = await supabase
        .from("PurchaseOrder")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch PO data: ${error.message}`);
      }

      if (!poData || poData.length === 0) {
        alert("No PO data found to download.");
        return;
      }

      // Prepare data for Excel export in the specified order
      const excelData = poData.map((po) => ({
        "Sr #": po.srNo || "",
        Style: po.style || "",
        Unit: po.unit || "",
        "Flute Type": po.fluteType || "",
        "Shade Card Approval Date": po.shadeCardApprovalDate
          ? new Date(po.shadeCardApprovalDate).toLocaleDateString("en-GB")
          : "",
        "Pending Validity": po.pendingValidity || 0,
        "PO.NUMBER": po.poNumber || "",
        Plant: po.plant || "",
        "PO Date": po.poDate
          ? new Date(po.poDate).toLocaleDateString("en-GB")
          : "",
        "Jockey Month": po.jockeyMonth || "",
        "Delivery Date": po.deliveryDate
          ? new Date(po.deliveryDate).toLocaleDateString("en-GB")
          : "",
        "Total PO Quantity": po.totalPOQuantity || 0,
        "Dispatch Quantity": po.dispatchQuantity || 0,
        "Dispatch Date": po.dispatchDate
          ? new Date(po.dispatchDate).toLocaleDateString("en-GB")
          : "",
        "Pending Quantity": po.pendingQuantity || 0,
        Customer: po.customer || "",
        "NO.of ups": po.noOfUps || 0,
        "No. Of Sheets": po.noOfSheets || 0,
        "Board Size": po.boardSize || "",
        "Die Code": po.dieCode || "",
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better visibility
      const columnWidths = [
        { wch: 8 }, // Sr #
        { wch: 20 }, // Style
        { wch: 8 }, // Unit
        { wch: 15 }, // Flute Type
        { wch: 20 }, // Shade Card Approval Date
        { wch: 15 }, // Pending Validity
        { wch: 12 }, // PO.NUMBER
        { wch: 12 }, // Plant
        { wch: 12 }, // PO Date
        { wch: 12 }, // Jockey Month
        { wch: 12 }, // Delivery Date
        { wch: 15 }, // Total PO Quantity
        { wch: 15 }, // Dispatch Quantity
        { wch: 12 }, // Dispatch Date
        { wch: 15 }, // Pending Quantity
        { wch: 25 }, // Customer
        { wch: 10 }, // NO.of ups
        { wch: 12 }, // No. Of Sheets
        { wch: 15 }, // Board Size
        { wch: 10 }, // Die Code
      ];

      worksheet["!cols"] = columnWidths;

      // Style the header row with yellow background and bold text
      const headerColumns = [
        "A1",
        "B1",
        "C1",
        "D1",
        "E1",
        "F1",
        "G1",
        "H1",
        "I1",
        "J1",
        "K1",
        "L1",
        "M1",
        "N1",
        "O1",
        "P1",
        "Q1",
        "R1",
        "S1",
        "T1",
      ];

      headerColumns.forEach((cell) => {
        if (worksheet[cell]) {
          worksheet[cell].s = {
            fill: {
              fgColor: { rgb: "FFFF00" }, // Yellow background
            },
            font: {
              bold: true, // Bold text
              sz: 11, // Font size
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
          };
        }
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Purchase_Orders_${currentDate}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);

      alert(`Successfully downloaded ${poData.length} PO records!`);
    } catch (err) {
      console.error("Download failed:", err);
      alert(
        `Download failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchaseOrders();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const parseDate = (value: any) => {
    if (!value) return new Date().toISOString();

    const d = new Date(value);

    if (isNaN(d.getTime())) return new Date().toISOString();

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleBulkUpload = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv,.xls,.xlsx";
      input.click();

      input.onchange = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        let parsedData: any[] = [];

        if (file.name.endsWith(".csv")) {
          parsedData = await new Promise((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data),
              error: (err) => reject(err),
            });
          });
        }

        if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        }

        if (parsedData.length === 0) {
          alert("No records found in file!");
          return;
        }

        const { data: maxIdData, error: maxIdError } = await supabase
          .from("PurchaseOrder")
          .select("id")
          .order("id", { ascending: false })
          .limit(1);

        if (maxIdError) {
          console.error("Error fetching last id:", maxIdError);
          alert("Failed to fetch last ID from database.");
          return;
        }

        let nextId = maxIdData?.[0]?.id ? maxIdData[0].id + 1 : 1;

        // Fetch all jobs from API to match styleItemSKU with style
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          alert("Authentication token not found. Please log in.");
          return;
        }

        const jobsResponse = await fetch(
          "https://nrprod.nrcontainers.com/api/jobs",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!jobsResponse.ok) {
          console.error("Error fetching jobs from API:", jobsResponse.status);
          alert("Failed to fetch job data for matching.");
          return;
        }

        const jobsApiData = await jobsResponse.json();
        const jobsData = jobsApiData.success ? jobsApiData.data : [];

        // Debug: Log raw API response for PKBB-1302-0105-N4
        console.log("🔍 Raw API response for jobs:", jobsApiData);
        if (jobsData && Array.isArray(jobsData)) {
          const pkbbJobs = jobsData.filter(
            (job: any) =>
              job.styleItemSKU && job.styleItemSKU.includes("PKBB-1302-0105")
          );
          console.log("🔍 Jobs containing PKBB-1302-0105:", pkbbJobs);
        }

        // Create a map for quick lookup: styleItemSKU -> nrcJobNo
        // Use case-insensitive and trimmed keys for better matching
        const jobMap = new Map();
        const jobMapDebug: { [key: string]: string } = {};

        if (jobsData && Array.isArray(jobsData)) {
          jobsData.forEach((job: any) => {
            if (job.styleItemSKU && job.nrcJobNo) {
              const normalizedStyle = job.styleItemSKU.trim().toUpperCase();
              jobMap.set(normalizedStyle, job.nrcJobNo);
              jobMapDebug[normalizedStyle] = job.nrcJobNo;
            }
          });
        }

        console.log(
          "Job mapping created from API:",
          jobMapDebug,
          `(${jobMap.size} jobs)`
        );

        // Debug: Log all available job styles for comparison
        console.log(
          "🔍 All available job styles from API:",
          Array.from(jobMap.keys())
        );

        // First pass: check if ALL styles can be matched
        const unmatchedStyles: string[] = [];
        const styleMatchResults: {
          row: number;
          style: string;
          matched: boolean;
          jobNo: string | null;
        }[] = [];

        parsedData.forEach((row: any, idx: number) => {
          if (!row["Customer"]) return;

          const styleValue = row["Style"];
          if (!styleValue) {
            unmatchedStyles.push(`Row ${idx + 1}: [EMPTY STYLE]`);
            styleMatchResults.push({
              row: idx + 1,
              style: "[EMPTY]",
              matched: false,
              jobNo: null,
            });
            return;
          }

          const normalizedStyle = styleValue.trim().toUpperCase();
          const matchedJobNo = jobMap.get(normalizedStyle);

          // Debug: Log detailed matching info for this specific style
          if (styleValue === "PKBB-1302-0105-N4") {
            console.log("🔍 DEBUG for PKBB-1302-0105-N4:");
            console.log("  Original style:", styleValue);
            console.log("  Normalized style:", normalizedStyle);
            console.log("  Found in jobMap:", jobMap.has(normalizedStyle));
            console.log("  Matched jobNo:", matchedJobNo);
            console.log(
              "  All similar styles in jobMap:",
              Array.from(jobMap.keys()).filter((key) =>
                key.includes("PKBB-1302-0105")
              )
            );
          }

          if (!matchedJobNo) {
            unmatchedStyles.push(`Row ${idx + 1}: "${styleValue}"`);
            styleMatchResults.push({
              row: idx + 1,
              style: styleValue,
              matched: false,
              jobNo: null,
            });
          } else {
            styleMatchResults.push({
              row: idx + 1,
              style: styleValue,
              matched: true,
              jobNo: matchedJobNo,
            });
          }
        });

        // Log all matching results for debugging
        console.log("Style matching results:", styleMatchResults);

        // If there are unmatched styles, stop and show error
        if (unmatchedStyles.length > 0) {
          const errorMessage = `❌ Upload stopped! ${
            unmatchedStyles.length
          } style(s) could not be matched with any job:\n\n${unmatchedStyles.join(
            "\n"
          )}\n\nPlease ensure all styles in the Excel file match exactly with the styleItemSKU in the Job table.\n\nNote: Matching is case-insensitive and ignores leading/trailing spaces.`;
          alert(errorMessage);
          console.error("Unmatched styles:", unmatchedStyles);
          console.log("Available job styles:", Array.from(jobMap.keys()));
          return;
        }

        // All styles matched, proceed with formatting
        const formattedData = parsedData
          .map((row: any, idx: number) => {
            if (!row["Customer"]) return null;

            const styleValue = row["Style"];
            if (!styleValue) return null;

            const normalizedStyle = styleValue.trim().toUpperCase();
            const matchedJobNo = jobMap.get(normalizedStyle);

            console.log(
              `Row ${
                idx + 1
              }: style="${styleValue}" (normalized: "${normalizedStyle}") -> jobNo="${matchedJobNo}"`
            );

            return {
              id: nextId + idx,
              // Map Excel columns to database fields according to the specified order
              srNo: row["Sr #"] ? parseInt(row["Sr #"]) : null,
              style: row["Style"] || null,
              unit: row["Unit"] || null,
              fluteType: row["Flute Type"] || null,
              shadeCardApprovalDate: row["Shade Card Approval Date"]
                ? parseDate(row["Shade Card Approval Date"])
                : null,
              pendingValidity: row["Pending Validity"]
                ? parseInt(row["Pending Validity"])
                : null,
              poNumber: row["PO.NUMBER"] || null,
              plant: row["Plant"] || null,
              poDate: row["PO Date"] ? parseDate(row["PO Date"]) : null,
              jockeyMonth: row["Jockey Month"] || null,
              deliveryDate: row["Delivery Date"]
                ? parseDate(row["Delivery Date"])
                : null,
              totalPOQuantity: row["Total PO Quantity"]
                ? parseInt(row["Total PO Quantity"])
                : null,
              dispatchQuantity: row["Dispatch Quantity"]
                ? parseInt(row["Dispatch Quantity"])
                : null,
              dispatchDate: row["Dispatch Date"]
                ? parseDate(row["Dispatch Date"])
                : null,
              pendingQuantity: row["Pending Quantity"]
                ? parseInt(row["Pending Quantity"])
                : null,
              customer: row["Customer"] || null,
              noOfUps: row["NO.of ups"] ? parseInt(row["NO.of ups"]) : null,
              noOfSheets: row["No. Of Sheets"]
                ? parseInt(row["No. Of Sheets"])
                : null,
              boardSize: row["Board Size"] || null,
              dieCode: row["Die Code"] ? parseInt(row["Die Code"]) : null,
              // Additional fields with defaults
              nrcDeliveryDate: null,
              sharedCardDiffDate: null,
              status: "created",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              jobNrcJobNo: matchedJobNo, // This will always have a value now
              userId: null,
            };
          })
          .filter((row) => row !== null);

        if (formattedData.length === 0) {
          alert("No valid rows with customer found!");
          return;
        }

        console.log(
          `✅ All ${formattedData.length} POs matched successfully with jobs. Proceeding with upload...`
        );

        const { error } = await supabase
          .from("PurchaseOrder")
          .insert(formattedData);

        if (error) {
          console.error("Bulk upload failed:", error);
          alert("Upload failed. Check console for details.");
        } else {
          alert(`Successfully uploaded ${formattedData.length} POs!`);
        }
      };
    } catch (err) {
      console.error("Bulk upload error:", err);
      alert("Something went wrong during bulk upload.");
    }
  };

  const handleNavigateToJobForm = (po: PurchaseOrder, formType: string) => {
    const jobId = po.jobNrcJobNo || po.job?.nrcJobNo;

    if (!jobId) {
      console.error("No job ID found in PO:", po);
      alert("Cannot navigate: Job ID not found");
      return;
    }

    navigate("/dashboard/planner/initiate-job/new", {
      state: {
        searchJobId: jobId,
        targetStep: formType,
      },
    });
  };

  console.log("filtered pos", filteredPOs);
  console.log("searched job", searchedJob);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header with Add PO Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Purchase Orders
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleAddPO}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Purchase Order</span>
          </button>

          <button
            onClick={handleBulkUpload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Upload size={18} className="sm:w-5 sm:h-5" />
            <span>Bulk PO Upload</span>
          </button>

          <button
            onClick={handleBulkDownload}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            <span>{loading ? "Downloading..." : "Download PO Data"}</span>
          </button>
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by NRC Job Number..."
              className="w-full pl-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />

            {/* Job Search Dropdown */}
            {searchTerm && jobOptions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {jobOptions.map((job) => (
                  <li
                    key={job.id}
                    onClick={() => {
                      setSearchTerm(job.nrcJobNo);
                      setSearchedJob(job);
                      setJobOptions([]);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                  >
                    {job.nrcJobNo}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 sm:py-3 border rounded-lg font-medium transition-colors text-sm sm:text-base ${
              showFilters
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Toggle Buttons */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 sm:py-3 flex items-center space-x-2 text-sm sm:text-base font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Grid size={18} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 sm:py-3 flex items-center space-x-2 text-sm sm:text-base font-medium transition-colors border-l border-gray-300 ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List size={18} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Filter Panel - Keep your existing filter panel code unchanged */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-6">
            {/* ... Keep all your existing filter panel code ... */}
            {/* Filter Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <div className="flex space-x-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Filters will only show Purchase Orders
                that need job planning (More Info Pending status)
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Color Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Number of Colors
                </h4>
                {/* Search bar for colors */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={noOfColorsSearch}
                    onChange={(e) => setNoOfColorsSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableNoOfColors
                    .filter((color) =>
                      color
                        .toLowerCase()
                        .includes(noOfColorsSearch.toLowerCase())
                    )
                    .map((color) => (
                      <label
                        key={color}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.noOfColors.includes(color)}
                          onChange={() => toggleNoOfColorFilter(color)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 truncate">
                          {color}
                        </span>
                      </label>
                    ))}
                  {availableNoOfColors.filter((color) =>
                    color.toLowerCase().includes(noOfColorsSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-sm text-gray-400">
                      {noOfColorsSearch
                        ? "No matching colors"
                        : "No colors available"}
                    </p>
                  )}
                </div>
              </div>

              {/* Board Size Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Dimensions
                </h4>
                {/* Search bar for dimensions */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search dimensions..."
                    value={dimensionsSearch}
                    onChange={(e) => setDimensionsSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableBoardSizes
                    .filter((boardSize) =>
                      boardSize
                        .toLowerCase()
                        .includes(dimensionsSearch.toLowerCase())
                    )
                    .map((boardSize) => (
                      <label
                        key={boardSize}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.boardSizes.includes(boardSize)}
                          onChange={() => toggleBoardSizeFilter(boardSize)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 truncate">
                          {boardSize}
                        </span>
                      </label>
                    ))}
                  {availableBoardSizes.filter((boardSize) =>
                    boardSize
                      .toLowerCase()
                      .includes(dimensionsSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-sm text-gray-400">
                      {dimensionsSearch
                        ? "No matching dimensions"
                        : "No board sizes available"}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Date Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Delivery Date Range
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.deliveryDateFrom}
                      onChange={(e) =>
                        handleFilterChange("deliveryDateFrom", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.deliveryDateTo}
                      onChange={(e) =>
                        handleFilterChange("deliveryDateTo", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filters.noOfColors.map((color) => (
                    <span
                      key={`color-${color}`}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      No. of Colors: {color}
                      <button
                        onClick={() => toggleNoOfColorFilter(color)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {filters.boardSizes.map((boardSize) => (
                    <span
                      key={`boardSize-${boardSize}`}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      Dimensions: {boardSize}
                      <button
                        onClick={() => toggleBoardSizeFilter(boardSize)}
                        className="ml-1 hover:text-green-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {filters.deliveryDateFrom && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      From: {filters.deliveryDateFrom}
                      <button
                        onClick={() =>
                          handleFilterChange("deliveryDateFrom", "")
                        }
                        className="ml-1 hover:text-purple-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.deliveryDateTo && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      To: {filters.deliveryDateTo}
                      <button
                        onClick={() => handleFilterChange("deliveryDateTo", "")}
                        className="ml-1 hover:text-purple-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {activeFilterCount > 0 ? (
              <>
                Showing {filteredPOs.length} POs needing job planning
                {activeFilterCount > 0 &&
                  ` (${activeFilterCount} filters applied)`}
              </>
            ) : (
              <>
                Showing {filteredPOs.length} of {purchaseOrders.length} purchase
                orders (all statuses)
              </>
            )}
          </div>

          {/* Bulk Job Planning Button - Only show if there are filtered POs */}
          {filteredPOs.length > 0 && activeFilterCount > 0 && (
            <button
              onClick={() => setShowBulkPlanningModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm"
            >
              <Settings size={16} />
              <span>Bulk Job Planning ({filteredPOs.length})</span>
            </button>
          )}
        </div>
      )}

      {showBulkPlanningModal && (
        <BulkJobPlanningModal
          filteredPOs={filteredPOs}
          onSave={handleBulkJobPlanning}
          onClose={() => setShowBulkPlanningModal(false)}
          onRefresh={fetchPurchaseOrders}
        />
      )}

      {/* Searched Job Details */}
      {searchedJob && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">
            Job Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">
                NRC Job No
              </p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">
                {searchedJob.nrcJobNo}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">
                Customer
              </p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">
                {searchedJob.customerName}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">
                Style
              </p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">
                {searchedJob.styleItemSKU}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">
                Status
              </p>
              <p className="text-xs sm:text-sm text-blue-800">
                {searchedJob.status}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs sm:text-sm text-blue-600 font-medium">
              Completion Status
            </p>
            <p className="text-xs sm:text-sm text-blue-800">
              {checkPOCompletionStatus(searchedJob)
                .replace("_", " ")
                .toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-base sm:text-lg text-gray-600">
            Loading purchase orders...
          </p>
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-6 text-sm sm:text-base"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {message && (
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-6 text-sm sm:text-base ${
            message.includes("Error")
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
          role="alert"
        >
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredPOs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg">
                {searchedJob || activeFilterCount > 0
                  ? "No purchase orders found matching the current search and filters."
                  : "No purchase orders found."}
              </p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                  {filteredPOs.map((po) => {
                    let completionStatus:
                      | "artwork_pending"
                      | "po_pending"
                      | "more_info_pending"
                      | "completed" = "po_pending";
                    completionStatus = checkPOCompletionStatus(po);

                    return (
                      <POdetailCard
                        key={po.id}
                        po={po}
                        onClick={handlePOClick}
                        jobCompletionStatus={completionStatus}
                      />
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PO Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Style
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dimensions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPOs.map((po) => {
                          let completionStatus:
                            | "artwork_pending"
                            | "po_pending"
                            | "more_info_pending"
                            | "completed" = "po_pending";
                          completionStatus = checkPOCompletionStatus(po);

                          const getStatusLabel = (status: string) => {
                            switch (status) {
                              case "artwork_pending":
                                return "Artwork Pending";
                              case "po_pending":
                                return "PO Pending";
                              case "more_info_pending":
                                return "More Info Pending";
                              case "completed":
                                return "Completed";
                              default:
                                return "Unknown";
                            }
                          };

                          return (
                            <tr
                              key={po.id}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handlePOClick(po)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {po.poNumber}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Plant: {po.plant}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className="text-sm text-gray-900 max-w-xs truncate"
                                  title={po.style || undefined}
                                >
                                  {po.style}
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className="text-sm text-gray-900 max-w-xs truncate"
                                  title={po.customer}
                                >
                                  {po.customer}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {po.totalPOQuantity?.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {po.noOfSheets} sheets
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {po.deliveryDate
                                    ? new Date(
                                        po.deliveryDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {po.boardSize}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                    completionStatus
                                  )}`}
                                >
                                  {getStatusLabel(completionStatus)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePOClick(po);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <PODetailModal
          po={selectedPO}
          completionStatus={checkPOCompletionStatus(selectedPO)}
          onClose={() => {
            setSelectedPO(null);
          }}
          onNavigateToForm={(_po, formType) =>
            handleNavigateToJobForm(selectedPO, formType)
          }
          onRefresh={fetchPurchaseOrders}
        />
      )}
    </div>
  );
};

export default PlannerJobs;
