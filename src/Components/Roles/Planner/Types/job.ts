// src/Components/Roles/Planner/Types/job.ts

export interface JobStep {
  stepNo: number;
  stepName: string;
  machineDetail: string; // This is the description/name of the machine assigned to this step
}

export interface MachineDetailInStep { // For machineDetails array in JobPlanStep
  id: string;
  unit: string | null;
  machineCode: string | null;
  machineType: string;
}

export interface Machine {
  machineType: 'inside Machine' | 'PaperStore' | 'QualityDept' | 'DispatchProcess' | 'Not Editable';
  id: string; // Machine ID (e.g., A007)
  unit: string;
  machineCode: string;
  description: string;
  type: string;
  capacity: number;
  remarks: string | null;
  status: string; // e.g., "available"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobs: any[]; // Assuming jobs array can contain various types, or specific job IDs
}

export interface PoDetailsPayload {
  nrcJobNo: string;
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
  srNo: number;
  style: string;
  totalPOQuantity: number;
  unit: string;
}

// NEW/UPDATED INTERFACES FOR STEP-SPECIFIC PAYLOADS (for PUT requests on completion)
export interface PaperStorePayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  sheetSize: string;
  quantity: number;
  available: number;
  issuedDate: string; // ISO string
  mill: string;
  extraMargin: string;
  gsm: string;
  quality: string;
}

export interface CorrugationPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  date: string; // ISO string
  shift: string;
  oprName: string;
  machineNo: string;
  noOfSheets: number;
  size: string;
  gsm1: string;
  gsm2: string;
  flute: string;
  remarks: string;
  qcCheckSignBy: string;
}

export interface PrintingDetailsPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  date: string; // ISO string
  shift: string;
  oprName: string; // From "Operator Name"
  noOfColours: number;
  inksUsed: string;
  postPrintingFinishingOkQty: number;
  wastage: number; // From "Wastage"
  coatingType: string;
  separateSheets: number;
  extraSheets: number;
  machine: string; // From "Machine"
}

export interface FluteLaminationPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  date: string; // ISO string
  shift: string;
  operatorName: string; // From "Operator Name"
  film: string; // From "Film Type"
  okQty: number;
  qcCheckSignBy: string; // From "QC Sign By"
  adhesive: string; // From "Adhesive"
  wastage: number; // From "Wastage"
}

export interface PunchingPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  date: string; // ISO string
  shift: string;
  operatorName: string; // From "Operator Name"
  okQty: number;
  machine: string; // From "Machine"
  qcCheckSignBy: string;
  die: string; // From "Die Used"
  wastage: number; // From "Wastage"
  remarks: string; // From "Remarks"
}

export interface FlapPastingPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  machineNo: string; // From "Machine No"
  date: string; // ISO string
  shift: string; // From Dart code, not in form, will default
  operatorName: string; // From "Operator Name"
  adhesive: string; // From "Adhesive"
  quantity: number; // From "Quantity"
  wastage: number; // From "Wastage"
  qcCheckSignBy: string;
  remarks: string; // From "Remarks"
}

export interface QCDetailsPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  date: string; // ISO string
  shift: string;
  operatorName: string;
  checkedBy: string; // From "Checked By"
  rejectedQty: number; // From "Reject Quantity"
  passQty: number;
  reasonForRejection: string; // From "Reason for Rejection"
  remarks: string; // From "Remarks"
  qcCheckSignBy: string;
}

export interface DispatchDetailsPayload {
  id?: number;
  jobStepId: number;
  jobNrcJobNo: string;
  status: 'in_progress' | 'accept';
  date: string; // ISO string
  shift: string;
  operatorName: string; // From "Operator Name"
  noOfBoxes: number;
  dispatchNo: string; // From "Dispatch No"
  dispatchDate: string; // ISO string
  remarks: string; // From "Remarks"
  balanceQty: number; // From "Balance Qty"
  qcCheckSignBy: string;
}


export interface JobPlanStep {
  id: number;
  jobStepId: number; // Added: This is the ID that step-specific payloads expect
  stepNo: number;
  stepName: string;
  machineDetails: MachineDetailInStep[];
  status: 'planned' | 'start' | 'stop';
  startDate: string | null;
  endDate: string | null;
  user: string | null; // Employee ID
  createdAt: string;
  updatedAt: string;
  // Optional properties to store fetched step-specific details
  paperStoreDetails?: PaperStorePayload;
  corrugationDetails?: CorrugationPayload;
  printingDetails?: PrintingDetailsPayload;
  fluteLaminationDetails?: FluteLaminationPayload;
  punchingDetails?: PunchingPayload;
  flapPastingDetails?: FlapPastingPayload;
  qcDetails?: QCDetailsPayload;
  dispatchDetails?: DispatchDetailsPayload;
}

export interface JobPlan {
  jobPlanId: number;
  nrcJobNo: string;
  jobDemand: 'high' | 'medium' | 'low' | null;
  createdAt: string;
  updatedAt: string;
  steps: JobPlanStep[];
}

export interface Job {
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

  jobSteps: JobStep[] | null;
}
