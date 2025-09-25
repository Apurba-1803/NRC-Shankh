// src/Components/Roles/Planner/planner_jobs.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Upload } from 'lucide-react';
import POdetailCard from './jobCard/POdetailCard';
import PODetailModal from './jobCard/PODetailModal';
import { supabase } from "../../../lib/supabaseClient"; 
import Papa from "papaparse";
import * as XLSX from "xlsx"; 

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
  // const [searchLoading, setSearchLoading] = useState(false);
  const [jobOptions, setJobOptions] = useState<Job[]>([]);
const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);


  // Helper function to check job completion status
const checkPOCompletionStatus = (po: any): 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' => {
  // 1. Check Artwork Details (using PO fields)
  console.log("po in check po completion function", po)
  if (!po.shadeCardApprovalDate) {
    return 'artwork_pending';
  }

  // 2. Check P.O. Details (using PO fields)
  if (!po.poNumber || !po.unit || !po.plant ||
      po.totalPOQuantity === null || po.dispatchQuantity === null ||
      po.pendingQuantity === null || po.noOfSheets === null ||
      !po.poDate || !po.deliveryDate || !po.dispatchDate || !po.nrcDeliveryDate) {
    return 'po_pending';
  }

  // 3. Check More Information (using merged job planning data)
  if (!po.hasJobPlan || !po.jobDemand || !po.jobSteps || po.jobSteps.length === 0) {
    return 'more_info_pending';
  }

  // 4. Additional validation for medium/regular demand jobs
  if (po.jobDemand === 'medium' && !po.machineId) {
    return 'more_info_pending';
  }

  // Check if all job steps are completed
  // const allStepsCompleted = po.jobSteps.every((step: any) => 
  //   step.stepDetails && step.stepDetails.status === "accept"
  // );

  // if (!allStepsCompleted) {
  //   return 'more_info_pending';
  // }

  return 'completed';
};


  // Function to merge purchase order data with job planning data
const mergePOWithJobPlanning = (purchaseOrders: any[], jobPlannings: any[]) => {
  return purchaseOrders.map(po => {
    // Find matching job planning by nrcJobNo
    const matchingJobPlan = jobPlannings.find(jp => 
      jp.nrcJobNo === po.jobNrcJobNo || jp.nrcJobNo === po.nrcJobNo
    );
   console.log("matching job plan", matchingJobPlan)
    // Merge the data
    return {
      ...po,
      // Add job planning fields
      jobDemand: matchingJobPlan?.jobDemand || null,
      machineId: matchingJobPlan?.steps[0]?.machineDetails[0]?.machineId || matchingJobPlan?.steps[1]?.machineDetails[0]?.machineId || null,
      jobSteps: matchingJobPlan?.steps || [],
      jobPlanId: matchingJobPlan?.jobPlanId || null,
      jobPlanCreatedAt: matchingJobPlan?.createdAt || null,
      jobPlanUpdatedAt: matchingJobPlan?.updatedAt || null,
      // Flag to indicate if job planning exists
      hasJobPlan: !!matchingJobPlan
    };
  });
};


  // Function to fetch all purchase orders
 // Function to fetch all purchase orders with job planning data
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

    // Fetch both APIs simultaneously
    const [poResponse, jobPlanResponse] = await Promise.all([
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
      })
    ]);

    // Check if both requests succeeded
    if (!poResponse.ok) {
      const errorData = await poResponse.json();
      throw new Error(errorData.message || `Failed to fetch purchase orders: ${poResponse.status}`);
    }

    if (!jobPlanResponse.ok) {
      console.warn('Job planning fetch failed, continuing with PO data only');
    }

    // Parse responses
    const poData = await poResponse.json();
    const jobPlanData = jobPlanResponse.ok ? await jobPlanResponse.json() : { success: true, data: [] };
    
    if (poData.success && Array.isArray(poData.data)) {
      // Merge purchase orders with job planning data
      const mergedData = mergePOWithJobPlanning(poData.data, jobPlanData.data || []);
      
      setPurchaseOrders(mergedData);
      setFilteredPOs(mergedData);
      console.log('✅ Merged PO and Job Planning data:', mergedData);
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


  // Function to search jobs by NRC Job Number
//   const searchJob = async () => {
//   if (!searchTerm.trim()) {
//     setSearchedJob(null);
//     setFilteredPOs(purchaseOrders);
//     setJobOptions([]); // clear dropdown
//     return;
//   }

//   setSearchLoading(true);
//   try {
//     const accessToken = localStorage.getItem("accessToken");
//     if (!accessToken) throw new Error("Authentication token not found.");

//     const response = await fetch("https://nrprod.nrcontainers.com/api/jobs", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (!response.ok) throw new Error(`Failed: ${response.status}`);

//     const data = await response.json();
//     if (data.success && Array.isArray(data.data)) {
//       // store all active jobs for dropdown
//       const activeJobs = data.data.filter((job: Job) =>
//         job.nrcJobNo.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setJobOptions(activeJobs);

//       const foundJob = activeJobs.find((job: Job) => job.status === "ACTIVE");
//       if (foundJob) {
//         setSearchedJob(foundJob);

//         const relatedPOs = purchaseOrders.filter(
//           (po) => po.jobNrcJobNo === foundJob.nrcJobNo
//         );
//         setFilteredPOs(relatedPOs);
//       } else {
//         setSearchedJob(null);
//         setFilteredPOs([]);
//       }
//     } else {
//       setSearchedJob(null);
//       setFilteredPOs([]);
//       setJobOptions([]);
//     }
//   } catch (err) {
//     console.error("Search Job Error:", err);
//     setSearchedJob(null);
//     setFilteredPOs([]);
//     setJobOptions([]);
//   } finally {
//     setSearchLoading(false);
//   }
// };

  // Handle PO card click
  const handlePOClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsModalOpen(true);
  };

  // Handle Add PO button click
  const handleAddPO = () => {
    navigate('/dashboard/planner/initiate-job/new');
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
      searchJob(value); // pass current value
    } else {
      setJobOptions([]);
      setSearchedJob(null);
      setFilteredPOs(purchaseOrders);
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

  // Handle search form submit
  // const handleSearchSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   searchJob();
  // };

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

  // ✅ Format as YYYY-MM-DD (no timezone shift)
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

      // --- 1. Handle CSV ---
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

      // --- 2. Handle Excel ---
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

      // --- 3. Get the last id from DB ---
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

      // --- 4. Map rows ---
      const formattedData = parsedData
        .map((row: any, idx: number) => {
          if (!row.customer) return null; // ✅ Skip rows with no customer

          return {
            id: nextId + idx, // ✅ Auto assign ID
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

      // --- 5. Insert into Supabase ---
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
  
  // ✅ SIMPLE: Just navigate to the same route as "Add Purchase Order"
  navigate('/dashboard/planner/initiate-job/new', { 
    state: { 
      searchJobId: jobId,  // Pass the job ID to search for
      targetStep: formType // Pass the target step
    }
  });
};


console.log("filtered pos", filteredPOs)

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


      {/* Search Bar */}
     <div className="mb-8">
  <div className="relative max-w-md w-full">
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Search by NRC Job Number..."
      className="w-full pl-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

    {/* Dropdown */}
   {searchTerm && jobOptions.length > 0 && (
  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
    {jobOptions.map((job) => (
      <li
        key={job.id}
        onClick={() => {
          setSearchTerm(job.nrcJobNo);
          setSearchedJob(job);
          const relatedPOs = purchaseOrders.filter(
            (po) => po.jobNrcJobNo === job.nrcJobNo
          );
          setFilteredPOs(relatedPOs);
          setJobOptions([]); // close dropdown
        }}
        className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
      >
        {job.nrcJobNo}
      </li>
    ))}
  </ul>
)}

  </div>
</div>



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
                {searchedJob ? 'No purchase orders found for this job.' : 'No purchase orders found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filteredPOs.map(po => {
  // Use the actual merged data instead of creating a mock job
  let completionStatus: 'artwork_pending' | 'po_pending' | 'more_info_pending' | 'completed' = 'po_pending';
  
  // Check completion status based on the actual PO and merged job planning data
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
  />
)}
    </div>
  );
};

export default PlannerJobs;
