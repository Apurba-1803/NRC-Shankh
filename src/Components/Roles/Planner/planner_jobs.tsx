// src/Components/Roles/Planner/planner_jobs.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Upload, Filter, X, Settings } from 'lucide-react';
import POdetailCard from './jobCard/POdetailCard';
import PODetailModal from './jobCard/PODetailModal';
import { supabase } from "../../../lib/supabaseClient"; 
import Papa from "papaparse";
import * as XLSX from "xlsx"; 
import {BulkJobPlanningModal} from './modal/BulkJobPlanning';

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

  jobBoardSize: string | null;
}

interface Job {
  id: number;
  nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  fluteType: string | null;
  status: 'ACTIVE' | 'INACTIVE';
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
  jobDemand: 'high' | 'medium' | 'low' | null;
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
  colors: string[];
  boardSizes: string[];
  deliveryDateFrom: string;
  deliveryDateTo: string;
}

const PlannerJobs: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // State for PO data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([]);
  
  // State for job search
  const [searchedJob, setSearchedJob] = useState<Job | null>(null);
  const [jobOptions, setJobOptions] = useState<Job[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    boardSizes: [],
    deliveryDateFrom: '',
    deliveryDateTo: ''
  });
  
  // Available filter options (extracted from data)
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableBoardSizes, setAvailableBoardSizes] = useState<string[]>([]);
  const [showBulkPlanningModal, setShowBulkPlanningModal] = useState(false);

  // Helper function to check job completion status
  const checkPOCompletionStatus = (po: any): 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' => {
    console.log("po in check po completion function", po)
    if (!po.shadeCardApprovalDate) {
      return 'artwork_pending';
    }

    if (!po.poNumber || !po.unit || !po.plant ||
        po.totalPOQuantity === null || po.dispatchQuantity === null ||
        po.pendingQuantity === null || po.noOfSheets === null ||
        !po.poDate || !po.deliveryDate || !po.dispatchDate || !po.nrcDeliveryDate) {
      return 'po_pending';
    }

    if (!po.hasJobPlan || !po.jobDemand || !po.jobSteps || po.jobSteps.length === 0) {
      return 'more_info_pending';
    }

    if (po.jobDemand === 'medium' && !po.machineId) {
      return 'more_info_pending';
    }

    return 'completed';
  };

  // Enhanced function to merge PO data with job planning AND job details
  const mergePOWithJobPlanningAndJobs = (purchaseOrders: any[], jobPlannings: any[], jobs: any[]) => {
    return purchaseOrders.map(po => {
      // Find matching job planning by nrcJobNo
      const matchingJobPlan = jobPlannings.find(jp => 
        jp.nrcJobNo === po.jobNrcJobNo || jp.nrcJobNo === po.nrcJobNo
      );

      // Find matching job details by nrcJobNo
      const matchingJob = jobs.find(job => 
        job.nrcJobNo === po.jobNrcJobNo || job.nrcJobNo === po.nrcJobNo
      );

      console.log("matching job plan", matchingJobPlan);
      console.log("matching job", matchingJob);

      // Merge all the data
      return {
        ...po,
        // Add job planning fields
        jobDemand: matchingJobPlan?.jobDemand || null,
        machineId: matchingJobPlan?.steps?.[0]?.machineDetails?.[0]?.machineId || 
                   matchingJobPlan?.steps?.[1]?.machineDetails?.[0]?.machineId || null,
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
        bottomLinerGSM: matchingJob?.bottomLinerGSM || null
      };
    });
  };

  // Extract unique values for filter options
 // Extract unique values for filter options (only from POs that need job planning)
const extractFilterOptions = (purchaseOrders: PurchaseOrder[]) => {
  const colors = new Set<string>();
  const boardSizes = new Set<string>();

  purchaseOrders.forEach(po => {
    // ADDED: Only extract options from POs that need more information
    const completionStatus = checkPOCompletionStatus(po);
    if (completionStatus !== 'more_info_pending') {
      return; // Skip this PO if it doesn't need job planning
    }

    // Extract colors from merged job data
    if (po.processColors) colors.add(po.processColors);
    
    // Extract board sizes/dimensions
    if (po.jobBoardSize) boardSizes.add(po.jobBoardSize);
  });

  setAvailableColors(Array.from(colors).filter(color => color && color.trim()));
  setAvailableBoardSizes(Array.from(boardSizes).filter(size => size && size.trim()));
};


  // Apply filters to purchase orders
 // Apply filters to purchase orders
const applyFilters = (pos: PurchaseOrder[]) => {
  return pos.filter(po => {
    // Check if any filters are active
    const hasActiveFilters = filters.colors.length > 0 || 
                            filters.boardSizes.length > 0 || 
                            filters.deliveryDateFrom || 
                            filters.deliveryDateTo;
    
    // ADDED: If any filters are applied, only show POs that need more information (job planning)
    if (hasActiveFilters) {
      const completionStatus = checkPOCompletionStatus(po);
      if (completionStatus !== 'more_info_pending') {
        return false; // Filter out completed, artwork_pending, and po_pending when filters are active
      }
    }

    // Color filter
    if (filters.colors.length > 0) {
      const poColors = [
        po.processColors,
      ].filter(color => color && color.trim());
      
      const hasMatchingColor = filters.colors.some(filterColor => 
        poColors.some(poColor => poColor?.toLowerCase().includes(filterColor.toLowerCase()))
      );
      
      if (!hasMatchingColor) return false;
    }

    // Board size/dimensions filter
    if (filters.boardSizes.length > 0) {
      const poBoardSize = po.jobBoardSize;
      if (!poBoardSize || !filters.boardSizes.some(size => 
        poBoardSize.toLowerCase().includes(size.toLowerCase())
      )) {
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
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle color filter toggle
  const toggleColorFilter = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  // Handle board size filter toggle
  const toggleBoardSizeFilter = (boardSize: string) => {
    setFilters(prev => ({
      ...prev,
      boardSizes: prev.boardSizes.includes(boardSize) 
        ? prev.boardSizes.filter(bs => bs !== boardSize)
        : [...prev.boardSizes, boardSize]
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      colors: [],
      boardSizes: [],
      deliveryDateFrom: '',
      deliveryDateTo: ''
    });
  };

  // Count active filters
  const activeFilterCount = filters.colors.length + 
                           filters.boardSizes.length + 
                           (filters.deliveryDateFrom ? 1 : 0) + 
                           (filters.deliveryDateTo ? 1 : 0);

  // Apply filters whenever filters change or purchase orders change
  useEffect(() => {
    let basePOs = purchaseOrders;
    
    // If there's a searched job, filter by that first
    if (searchedJob) {
      basePOs = purchaseOrders.filter(po => po.jobNrcJobNo === searchedJob.nrcJobNo);
    }
    
    // Apply additional filters
    const filtered = applyFilters(basePOs);
    setFilteredPOs(filtered);
  }, [filters, purchaseOrders, searchedJob]);



 const handleBulkJobPlanning = async (bulkJobPlanningData: any) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Authentication token not found.');

    // Create job plans for all filtered POs
    const jobPlanPromises = bulkJobPlanningData.nrcJobNos.map(async (nrcJobNo: string, poIndex: number) => {
      // Find the corresponding PO to get the unit
      const correspondingPO = filteredPOs.find(po => po.jobNrcJobNo === nrcJobNo);
      const poUnit = correspondingPO?.unit || 'Unit 1'; // Fallback to 'Unit 1' if not found

      const jobPlanPayload = {
        nrcJobNo: nrcJobNo,
        jobDemand: bulkJobPlanningData.jobDemand,
        // FIXED: Sort steps by predefined order and ensure consecutive step numbers
        steps: bulkJobPlanningData.steps
          .sort((a: any, b: any) => a.stepNo - b.stepNo) // Sort by stepNo first
          .map((step: any, index: number) => {
            // FIXED: Always provide machineDetails array, even for steps without machines
            const machineDetails = [];
            
            if (step.machineId && step.machineCode) {
              // Step has machine assignment
              machineDetails.push({
                id: step.machineId,
                unit: poUnit, // FIXED: Use PO's unit instead of hardcoded 'Unit 1'
                machineCode: step.machineCode,
                machineType: step.machineDetail || 'Production Step'
              });
            } else {
              // FIXED: Step has no machine (like PaperStore, QualityDept, DispatchProcess)
              machineDetails.push({
                unit: poUnit, // FIXED: Use PO's unit
                machineId: null,
                machineCode: null,
                machineType: "Not Assigned"
              });
            }

            return {
              jobStepId: index + 1, // FIXED: Use consecutive index for jobStepId
              stepNo: index + 1,    // FIXED: Use consecutive index for stepNo
              stepName: step.stepName,
              machineDetails: machineDetails, // Always an array with at least one entry
              status: 'planned' as const,
              startDate: null,
              endDate: null,
              user: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          })
      };

      console.log(`Creating job plan for ${nrcJobNo} with unit: ${poUnit}`, jobPlanPayload);

      const response = await fetch('https://nrprod.nrcontainers.com/api/job-planning/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(jobPlanPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create job plan for ${nrcJobNo}: ${errorData.message || response.statusText}`);
      }

      return response.json();
    });

    // Wait for all job plans to be created
    const results = await Promise.all(jobPlanPromises);
    console.log('All job plans created successfully:', results);

    // Update machine statuses to busy (only for machines that were actually assigned)
    if (bulkJobPlanningData.selectedMachines && bulkJobPlanningData.selectedMachines.length > 0) {
      const machineUpdatePromises = bulkJobPlanningData.selectedMachines
        .filter((machine: any) => machine.id) // Only update machines with actual IDs
        .map(async (machine: any) => {
          try {
            const response = await fetch(`https://nrprod.nrcontainers.com/api/machines/${machine.id}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ status: 'busy' }),
            });

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

    setShowBulkPlanningModal(false);
    alert(`Successfully created job plans for ${bulkJobPlanningData.nrcJobNos.length} POs!`);
    
    // Refresh the data
    fetchPurchaseOrders();
    
  } catch (err) {
    console.error('Bulk job planning error:', err);
    alert(`Failed to create bulk job plans: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};


  // Enhanced function to fetch all three APIs and merge data
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Fetch all three APIs simultaneously
      const [poResponse, jobPlanResponse, jobsResponse] = await Promise.all([
        fetch('https://nrprod.nrcontainers.com/api/purchase-orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
        fetch('https://nrprod.nrcontainers.com/api/job-planning/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
        fetch('https://nrprod.nrcontainers.com/api/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })
      ]);

      // Check responses
      if (!poResponse.ok) {
        const errorData = await poResponse.json();
        throw new Error(errorData.message || `Failed to fetch purchase orders: ${poResponse.status}`);
      }

      if (!jobPlanResponse.ok) {
        console.warn('Job planning fetch failed, continuing without job planning data');
      }

      if (!jobsResponse.ok) {
        console.warn('Jobs fetch failed, continuing without job details');
      }

      // Parse responses
      const poData = await poResponse.json();
      const jobPlanData = jobPlanResponse.ok ? await jobPlanResponse.json() : { success: true, data: [] };
      const jobsData = jobsResponse.ok ? await jobsResponse.json() : { success: true, data: [] };
      
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
        
        console.log('✅ Merged PO, Job Planning, and Job data:', mergedData);
      } else {
        setError('Unexpected API response format or data is not an array.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Fetch Purchase Orders Error:', err);
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
    setIsModalOpen(true);
  };

  // Handle Add PO button click
  const handleAddPO = () => {
    navigate('/dashboard/planner/initiate-job/new');
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

        const formattedData = parsedData
          .map((row: any, idx: number) => {
            if (!row.customer) return null;

            return {
              id: nextId + idx,
              boardSize: row.boardSize || null,
              customer: row.customer || null,
              deliveryDate: row.deliveryDate ? parseDate(row.deliveryDate) : null,
              dieCode: row.dieCode || null,
              dispatchDate: row.dispatchDate ? parseDate(row.dispatchDate) : null,
              dispatchQuantity: row.dispatchQuantity ? parseInt(row.dispatchQuantity) : null,
              fluteType: row.fluteType || null,
              jockeyMonth: row.jockeyMonth || null,
              noOfUps: row.noOfUps ? parseInt(row.noOfUps) : null,
              nrcDeliveryDate: row.nrcDeliveryDate ? parseDate(row.nrcDeliveryDate) : null,
              noOfSheets: row.noOfSheets ? parseInt(row.noOfSheets) : null,
              poDate: row.poDate ? parseDate(row.poDate) : null,
              poNumber: row.poNumber || null,
              pendingQuantity: row.pendingQuantity ? parseInt(row.pendingQuantity) : null,
              pendingValidity: row.pendingValidity || null,
              plant: row.plant || null,
              shadeCardApprovalDate: row.shadeCardApprovalDate ? parseDate(row.shadeCardApprovalDate) : null,
              sharedCardDiffDate: row.sharedCardDiffDate ? parseInt(row.sharedCardDiffDate) : null,
              srNo: row.srNo || null,
              style: row.style || null,
              totalPOQuantity: row.totalPOQuantity ? parseInt(row.totalPOQuantity) : null,
              unit: row.unit || null,
              status: row.status || null,
              createdAt: row.createdAt ? parseDate(row.createdAt) : new Date().toISOString(),
              updatedAt: row.updatedAt ? parseDate(row.updatedAt) : new Date().toISOString(),
              jobNrcJobNo: row.jobNrcJobNo || null,
              userId: row.userId || null,
            };
          })
          .filter((row) => row !== null);

        if (formattedData.length === 0) {
          alert("No valid rows with customer found!");
          return;
        }

        const { error } = await supabase.from("PurchaseOrder").insert(formattedData);

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
      console.error('No job ID found in PO:', po);
      alert('Cannot navigate: Job ID not found');
      return;
    }
    
    navigate('/dashboard/planner/initiate-job/new', { 
      state: { 
        searchJobId: jobId,
        targetStep: formType
      }
    });
  };

  console.log("filtered pos", filteredPOs);
  console.log("searched job", searchedJob);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header with Add PO Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Purchase Orders</h1>
        
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

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
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-6">
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
        <strong>Note:</strong> Filters will only show Purchase Orders that need job planning (More Info Pending status)
      </p>
    </div>
            

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Color Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableColors.map(color => (
                    <label key={color} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={() => toggleColorFilter(color)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 truncate">{color}</span>
                    </label>
                  ))}
                  {availableColors.length === 0 && (
                    <p className="text-sm text-gray-400">No colors available</p>
                  )}
                </div>
              </div>

              {/* Board Size Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Dimensions</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableBoardSizes.map(boardSize => (
                    <label key={boardSize} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.boardSizes.includes(boardSize)}
                        onChange={() => toggleBoardSizeFilter(boardSize)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 truncate">{boardSize}</span>
                    </label>
                  ))}
                  {availableBoardSizes.length === 0 && (
                    <p className="text-sm text-gray-400">No board sizes available</p>
                  )}
                </div>
              </div>

              {/* Delivery Date Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Delivery Date Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.deliveryDateFrom}
                      onChange={(e) => handleFilterChange('deliveryDateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.deliveryDateTo}
                      onChange={(e) => handleFilterChange('deliveryDateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.colors.map(color => (
                    <span
                      key={`color-${color}`}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      Color: {color}
                      <button
                        onClick={() => toggleColorFilter(color)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {filters.boardSizes.map(boardSize => (
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
                        onClick={() => handleFilterChange('deliveryDateFrom', '')}
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
                        onClick={() => handleFilterChange('deliveryDateTo', '')}
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
     {/* Results count */}
{!loading && !error && (
  <div className="mb-4 flex justify-between items-center">
    <div className="text-sm text-gray-600">
      {activeFilterCount > 0 ? (
        <>
          Showing {filteredPOs.length} POs needing job planning 
          {activeFilterCount > 0 && ` (${activeFilterCount} filters applied)`}
        </>
      ) : (
        <>
          Showing {filteredPOs.length} of {purchaseOrders.length} purchase orders (all statuses)
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
  />
)}

      {/* Searched Job Details */}
      {searchedJob && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">Job Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">NRC Job No</p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">{searchedJob.nrcJobNo}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Customer</p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">{searchedJob.customerName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Style</p>
              <p className="text-xs sm:text-sm text-blue-800 truncate">{searchedJob.styleItemSKU}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Status</p>
              <p className="text-xs sm:text-sm text-blue-800">{searchedJob.status}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs sm:text-sm text-blue-600 font-medium">Completion Status</p>
            <p className="text-xs sm:text-sm text-blue-800">{checkPOCompletionStatus(searchedJob).replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-base sm:text-lg text-gray-600">Loading purchase orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-6 text-sm sm:text-base" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {message && (
        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-6 text-sm sm:text-base ${message.includes('Error') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredPOs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg">
                {searchedJob || activeFilterCount > 0 ? 'No purchase orders found matching the current search and filters.' : 'No purchase orders found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filteredPOs.map(po => {
                let completionStatus: 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' = 'po_pending';
                
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
        </>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <PODetailModal
          po={selectedPO}
          completionStatus={checkPOCompletionStatus(selectedPO)}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPO(null);
          }}
          onNavigateToForm={(po, formType) => handleNavigateToJobForm(selectedPO, formType)}
           onRefresh={fetchPurchaseOrders}
        />
      )}
    </div>
  );
};

export default PlannerJobs;
