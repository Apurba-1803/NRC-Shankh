import React from "react";
import {
  X,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";

interface Job {
  id: number;
  nrcJobNo: string;
  status?: string;
  finalStatus?: string;
  company?: string;
  customerName?: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
  totalDuration?: number;
  jobDetails?: any;
  purchaseOrderDetails?: any;
  allSteps?: any[];
  allStepDetails?: {
    paperStore?: any[];
    printingDetails?: any[];
    corrugation?: any[];
    flutelam?: any[];
    punching?: any[];
    sideFlapPasting?: any[];
    qualityDept?: any[];
    dispatchProcess?: any[];
  };

  steps?: any[];
}

interface DetailedJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const DetailedJobModal: React.FC<DetailedJobModalProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  if (!isOpen || !job) return null;

  const generatePDF = async () => {
    if (!job) return;

    setIsGeneratingPDF(true);

    try {
      // Create PDF instance
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Colors - Job Card Style
      const colors = {
        primary: [0, 102, 204], // Blue for headers
        white: [255, 255, 255],
        black: [0, 0, 0],
        lightGray: [240, 240, 240],
        darkGray: [64, 64, 64],
      };

      // Helper function to draw a colored rectangle
      const drawRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        color: number[]
      ) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x, y, width, height, "F");
      };

      // Helper function to draw a border
      const drawBorder = (
        x: number,
        y: number,
        width: number,
        height: number,
        lineWidth: number = 0.5
      ) => {
        pdf.setDrawColor(colors.black[0], colors.black[1], colors.black[2]);
        pdf.setLineWidth(lineWidth);
        pdf.rect(x, y, width, height);
      };

      // Draw thick blue borders on left and right
      drawRect(0, 0, 3, pageHeight, colors.primary);
      drawRect(pageWidth - 3, 0, 3, pageHeight, colors.primary);

      // Draw thin blue borders on top and bottom
      drawRect(0, 0, pageWidth, 2, colors.primary);
      drawRect(0, pageHeight - 2, pageWidth, 2, colors.primary);

      // Header Section - Company Logo and Name
      drawRect(15, yPosition, 25, 15, colors.primary);
      drawBorder(15, yPosition, 25, 15, 1);

      // NRC Logo area
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.text("NRC", 27.5, yPosition + 8, { align: "center" });

      // Company Name
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      pdf.text("NRCONTAINERS PRIVATE LIMITED", 50, yPosition + 5);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("INTELLIGENT PACKAGING", 50, yPosition + 10);

      // Job Card Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text("JOB DETAILS", pageWidth - 20, yPosition + 10, {
        align: "right",
      });

      yPosition += 25;

      // Main Information Section
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

      // Left Column
      pdf.text(
        `Client's Name : ${String(
          job.jobDetails?.company || job.jobDetails?.customerName || "N/A"
        )}`,
        20,
        yPosition
      );
      pdf.text(`Job Name : ${String(job.nrcJobNo)}`, 20, yPosition + 6);
      pdf.text(
        `Date : ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        20,
        yPosition + 12
      );

      // Right Column
      // Handle both array and object formats for PO details
      const poDetails = Array.isArray(job.purchaseOrderDetails)
        ? job.purchaseOrderDetails[0]
        : job.purchaseOrderDetails;

      pdf.text(
        `Job Card No. : ${String(job.id || "N/A")}`,
        pageWidth / 2 + 20,
        yPosition
      );
      pdf.text(
        `Quantity : ${String(poDetails?.totalPOQuantity || "N/A")}`,
        pageWidth / 2 + 20,
        yPosition + 6
      );

      // Bottom Row
      pdf.text(
        `PO No. : ${String(poDetails?.poNumber || "N/A")}`,
        20,
        yPosition + 18
      );
      pdf.text(
        `No of Sheets: ${String(poDetails?.noOfSheets || "N/A")}`,
        pageWidth / 2 + 20,
        yPosition + 18
      );

      yPosition += 35;

      // Job Card Style Section Function - Match UI structure exactly
      const addJobCardSection = (title: string, step: any) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        // Section Header with blue background
        drawRect(15, yPosition, pageWidth - 30, 8, colors.primary);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        pdf.text(title, pageWidth / 2, yPosition + 5.5, { align: "center" });
        yPosition += 12;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

        // Machine Details Section (if available)
        if (step.machineDetails && step.machineDetails.length > 0) {
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text("Machine Details:", 20, yPosition);
          yPosition += 6;

          step.machineDetails.forEach((machine: any) => {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");

            if (machine.unit) {
              pdf.text(`Unit: ${machine.unit}`, 25, yPosition);
              yPosition += 4;
            }
            if (machine.machineId) {
              pdf.text(`Machine ID: ${machine.machineId}`, 25, yPosition);
              yPosition += 4;
            }
            if (machine.machineCode) {
              pdf.text(`Machine Code: ${machine.machineCode}`, 25, yPosition);
              yPosition += 4;
            }
            if (machine.machineType) {
              pdf.text(`Machine Type: ${machine.machineType}`, 25, yPosition);
              yPosition += 4;
            }
            yPosition += 2; // Space between machines
          });
        }

        // Step Details Section (if available)
        const stepDetails = getStepDetailsFromStep(step);
        if (stepDetails && stepDetails.length > 0) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text("Step Details:", 20, yPosition);
          yPosition += 6;

          stepDetails.forEach((detail: any) => {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");

            // Display step-specific fields exactly as in UI
            if (step.stepName === "PaperStore") {
              if (detail.sheetSize) {
                pdf.text(`Sheet Size: ${detail.sheetSize}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.available) {
                pdf.text(`Available: ${detail.available}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.issuedDate) {
                const formattedDate = new Date(
                  detail.issuedDate
                ).toLocaleDateString();
                pdf.text(`Issued Date: ${formattedDate}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.mill) {
                pdf.text(`Mill: ${detail.mill}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.gsm) {
                pdf.text(`GSM: ${detail.gsm}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.quality) {
                pdf.text(`Quality: ${detail.quality}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.extraMargin) {
                pdf.text(`Extra Margin: ${detail.extraMargin}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "PrintingDetails") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.machine) {
                pdf.text(`Machine: ${detail.machine}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.oprName) {
                pdf.text(`Operator: ${detail.oprName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.inksUsed) {
                pdf.text(`Inks Used: ${detail.inksUsed}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.coatingType) {
                pdf.text(`Coating Type: ${detail.coatingType}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.noOfColours) {
                pdf.text(
                  `No. of Colours: ${detail.noOfColours}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.extraSheets) {
                pdf.text(`Extra Sheets: ${detail.extraSheets}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.separateSheets) {
                pdf.text(
                  `Separate Sheets: ${detail.separateSheets}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.wastage) {
                pdf.text(`Wastage: ${detail.wastage}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "Corrugation") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.machineNo) {
                pdf.text(`Machine No: ${detail.machineNo}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.oprName) {
                pdf.text(`Operator: ${detail.oprName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.flute) {
                pdf.text(`Flute: ${detail.flute}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.size) {
                pdf.text(`Size: ${detail.size}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.gsm1) {
                pdf.text(`GSM 1: ${detail.gsm1}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.gsm2) {
                pdf.text(`GSM 2: ${detail.gsm2}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "FluteLaminateBoardConversion") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.film) {
                pdf.text(`Film: ${detail.film}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.adhesive) {
                pdf.text(`Adhesive: ${detail.adhesive}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.wastage) {
                pdf.text(`Wastage: ${detail.wastage}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "Punching") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.machine) {
                pdf.text(`Machine: ${detail.machine}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.die) {
                pdf.text(`Die: ${detail.die}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.wastage) {
                pdf.text(`Wastage: ${detail.wastage}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "SideFlapPasting") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.machineNo) {
                pdf.text(`Machine No: ${detail.machineNo}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.adhesive) {
                pdf.text(`Adhesive: ${detail.adhesive}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.wastage) {
                pdf.text(`Wastage: ${detail.wastage}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "QualityDept") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.checkedBy) {
                pdf.text(`Checked By: ${detail.checkedBy}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.rejectedQty) {
                pdf.text(`Rejected Qty: ${detail.rejectedQty}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.reasonForRejection) {
                pdf.text(
                  `Reason for Rejection: ${detail.reasonForRejection}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else if (step.stepName === "DispatchProcess") {
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.balanceQty) {
                pdf.text(`Balance Qty: ${detail.balanceQty}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.dispatchNo) {
                pdf.text(`Dispatch No: ${detail.dispatchNo}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.dispatchDate) {
                const formattedDate = new Date(
                  detail.dispatchDate
                ).toLocaleDateString();
                pdf.text(`Dispatch Date: ${formattedDate}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.holdRemark) {
                pdf.text(`Hold Remark: ${detail.holdRemark}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.completeRemark) {
                pdf.text(
                  `Complete Remark: ${detail.completeRemark}`,
                  25,
                  yPosition
                );
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            } else {
              // Generic fields for other steps
              if (detail.quantity) {
                pdf.text(`Quantity: ${detail.quantity}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.shift) {
                pdf.text(`Shift: ${detail.shift}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.operatorName) {
                pdf.text(`Operator: ${detail.operatorName}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.status) {
                pdf.text(`Status: ${detail.status}`, 25, yPosition);
                yPosition += 4;
              }
              if (detail.remarks) {
                pdf.text(`Remarks: ${detail.remarks}`, 25, yPosition);
                yPosition += 4;
              }
            }
            yPosition += 2; // Space between details
          });
        }

        yPosition += 8; // Space after section
      };

      // Use the same data structure as the UI
      const availableSteps = job.allSteps || job.steps || [];

      if (availableSteps.length > 0) {
        // Define step order for sorting (same as UI)
        const stepOrder = [
          "PaperStore",
          "PrintingDetails",
          "Corrugation",
          "FluteLaminateBoardConversion",
          "Punching",
          "SideFlapPasting",
          "QualityDept",
          "DispatchProcess",
        ];

        // Sort steps according to predefined order (same as UI)
        const sortedSteps = [...availableSteps].sort((a, b) => {
          const aIndex = stepOrder.indexOf(a.stepName);
          const bIndex = stepOrder.indexOf(b.stepName);
          return (
            (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
          );
        });

        // Add each step as a job card section
        sortedSteps.forEach((step: any) => {
          const sectionTitle = getSectionTitle(step.stepName);

          addJobCardSection(sectionTitle, step);
        });
      }

      // Helper function to get section titles
      function getSectionTitle(stepName: string): string {
        switch (stepName) {
          case "PaperStore":
            return "PAPER STORE";
          case "PrintingDetails":
            return "PRINTING DETAILS";
          case "Corrugation":
            return "CORRUGATION";
          case "FluteLaminateBoardConversion":
            return "FLUTE LAMINATION";
          case "Punching":
            return "PUNCHING";
          case "SideFlapPasting":
            return "FLAP PASTING";
          case "QualityDept":
            return "QUALITY DEPT";
          case "DispatchProcess":
            return "DISPATCH";
          default:
            return stepName.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();
        }
      }

      // Get step details from the step object (same logic as UI)
      function getStepDetailsFromStep(step: any) {
        // Check multiple possible locations for step details (same as UI)
        if (job && job.allStepDetails) {
          switch (step.stepName) {
            case "PaperStore":
              return job.allStepDetails.paperStore || [];
            case "PrintingDetails":
              return job.allStepDetails.printingDetails || [];
            case "Corrugation":
              return job.allStepDetails.corrugation || [];
            case "FluteLaminateBoardConversion":
              return job.allStepDetails.flutelam || [];
            case "Punching":
              return job.allStepDetails.punching || [];
            case "SideFlapPasting":
              return job.allStepDetails.sideFlapPasting || [];
            case "QualityDept":
              return job.allStepDetails.qualityDept || [];
            case "DispatchProcess":
              return job.allStepDetails.dispatchProcess || [];
            default:
              return [];
          }
        }

        // Handle the actual data structure from job planning
        if (step.stepDetails) {
          // If stepDetails has a data property (object structure)
          if (step.stepDetails.data) {
            return [step.stepDetails.data]; // Wrap single object in array
          }
          // If stepDetails is already an array
          else if (Array.isArray(step.stepDetails)) {
            return step.stepDetails;
          }
        }

        // If no stepDetails, create a basic entry with available data
        if (step.machineDetails && step.machineDetails.length > 0) {
          return [
            {
              date: step.startDate
                ? new Date(step.startDate).toLocaleDateString()
                : "",
              status: step.status || "planned",
              machineDetails: step.machineDetails,
              stepNo: step.stepNo,
              user: step.user || "",
            },
          ];
        }

        return [];
      }

      // Simple footer - Job Card style doesn't need complex footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Simple footer text
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

        // Center
        pdf.text(
          `Generated on ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      pdf.save(
        `NRC_Job_${job.nrcJobNo.replace(/[^a-zA-Z0-9]/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  console.log("Rendering DetailedJobModal with job:", job);

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{job.nrcJobNo}</h2>
              <p className="text-blue-100">
                {job.jobDetails?.company ||
                  job.jobDetails?.customerName ||
                  "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Download PDF Button */}
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              title="Download PDF"
            >
              <Download size={20} />
              {isGeneratingPDF && (
                <span className="text-sm">Generating...</span>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Content - Rest of your existing content remains unchanged */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Job Details */}
              {job.jobDetails && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Job Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Style ID:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.styleId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Box Dimensions:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.boxDimensions || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Board Size:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.boardSize || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Process Colors:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.processColors || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        No. of Ups:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.noUps || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Width:</span>
                      <span className="text-gray-900">
                        {job.jobDetails.width || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Height:</span>
                      <span className="text-gray-900">
                        {job.jobDetails.height || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Length:</span>
                      <span className="text-gray-900">
                        {job.jobDetails.length || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Pre-Rate:
                      </span>
                      <span className="text-gray-900">
                        ₹{job.jobDetails.preRate || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Order Details */}
              {job.purchaseOrderDetails && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Purchase Order Details
                  </h3>
                  {(() => {
                    // Handle both array and object formats
                    const poDetails = Array.isArray(job.purchaseOrderDetails)
                      ? job.purchaseOrderDetails[0]
                      : job.purchaseOrderDetails;

                    if (!poDetails)
                      return (
                        <p className="text-sm text-gray-500">
                          No PO details available
                        </p>
                      );

                    return (
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            PO Number:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.poNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Customer:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.customer || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Style:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.style || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Unit:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.unit || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Board Size:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.boardSize || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Flute Type:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.fluteType || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Total Quantity:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.totalPOQuantity || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Pending Quantity:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.pendingQuantity || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            No. of Sheets:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.noOfSheets || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            No. of Ups:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.noOfUps || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Die Code:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.dieCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            PO Date:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.poDate
                              ? new Date(poDetails.poDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Delivery Date:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.deliveryDate
                              ? new Date(
                                  poDetails.deliveryDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            NRC Delivery Date:
                          </span>
                          <span className="text-gray-900">
                            {poDetails.nrcDeliveryDate
                              ? new Date(
                                  poDetails.nrcDeliveryDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        {poDetails.shadeCardApprovalDate && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">
                              Shade Card Approval:
                            </span>
                            <span className="text-gray-900">
                              {new Date(
                                poDetails.shadeCardApprovalDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Status:
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              poDetails.status === "active"
                                ? "bg-green-100 text-green-800"
                                : poDetails.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : poDetails.status === "created"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {poDetails.status || "N/A"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Timeline & Status */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline & Status
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-900">
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  {job.completedAt && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Completed:
                      </span>
                      <span className="text-gray-900">
                        {new Date(job.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {job.completedBy && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Completed By:
                      </span>
                      <span className="text-gray-900">{job.completedBy}</span>
                    </div>
                  )}
                  {job.totalDuration && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Total Duration:
                      </span>
                      <span className="text-gray-900">
                        {job.totalDuration} days
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : job.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rest of your existing steps section remains unchanged */}
              {/* Steps Information */}
              {((job.allSteps && job.allSteps.length > 0) ||
                (job.steps && job.steps.length > 0)) && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {(job.status || job.finalStatus) === "completed"
                      ? "Completed Steps"
                      : "Job Steps"}
                    ({job.allSteps?.length || job.steps?.length || 0})
                  </h3>
                  {/* Your existing steps content remains unchanged */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(() => {
                      // Define step order for sorting
                      const stepOrder = [
                        "PaperStore",
                        "PrintingDetails",
                        "Corrugation",
                        "FluteLaminateBoardConversion",
                        "Punching",
                        "SideFlapPasting",
                        "QualityDept",
                        "DispatchProcess",
                      ];

                      // Get the available steps data (prioritize allSteps, then steps, then stepDetails)
                      const availableSteps = job.allSteps || job.steps || [];

                      // Sort steps according to predefined order
                      const sortedSteps = [...availableSteps].sort((a, b) => {
                        const aIndex = stepOrder.indexOf(a.stepName);
                        const bIndex = stepOrder.indexOf(b.stepName);
                        return (
                          (aIndex === -1 ? 999 : aIndex) -
                          (bIndex === -1 ? 999 : bIndex)
                        );
                      });

                      return sortedSteps.map((step: any, stepIndex: number) => {
                        // FIXED: Get step details from allStepDetails based on step name
                        const getStepDetails = (stepName: string) => {
                          // Check multiple possible locations for step details
                          if (job.allStepDetails) {
                            // Use proper type-safe access
                            switch (stepName) {
                              case "PaperStore":
                                return job.allStepDetails.paperStore || [];
                              case "PrintingDetails":
                                return job.allStepDetails.printingDetails || [];
                              case "Corrugation":
                                return job.allStepDetails.corrugation || [];
                              case "FluteLaminateBoardConversion":
                                return job.allStepDetails.flutelam || [];
                              case "Punching":
                                return job.allStepDetails.punching || [];
                              case "SideFlapPasting":
                                return job.allStepDetails.sideFlapPasting || [];
                              case "QualityDept":
                                return job.allStepDetails.qualityDept || [];
                              case "DispatchProcess":
                                return job.allStepDetails.dispatchProcess || [];
                              default:
                                return [];
                            }
                          }
                          if (step.stepDetails) {
                            // If stepDetails has a data property (object structure)
                            if (step.stepDetails.data) {
                              return [step.stepDetails.data]; // Wrap single object in array
                            }
                            // If stepDetails is already an array
                            else if (Array.isArray(step.stepDetails)) {
                              return step.stepDetails;
                            }
                          }

                          return [];
                        };

                        const stepDetails = getStepDetails(step.stepName);

                        return (
                          <div
                            key={step.id || stepIndex}
                            className="bg-white p-3 rounded border border-gray-100"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800 text-sm">
                                {step.stepName.replace(
                                  /([a-z])([A-Z])/g,
                                  "$1 $2"
                                )}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  step.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : step.status === "in-progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {step.status}
                              </span>
                            </div>

                            {/* Step Timeline */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                              {step.startDate && (
                                <div className="flex justify-between">
                                  <span>Start:</span>
                                  <span>
                                    {new Date(
                                      step.startDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {step.endDate && (
                                <div className="flex justify-between">
                                  <span>End:</span>
                                  <span>
                                    {new Date(
                                      step.endDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Machine Details */}
                            {step.machineDetails &&
                              step.machineDetails.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs font-medium text-gray-700 mb-1">
                                    Machine Details:
                                  </p>
                                  {step.machineDetails.map(
                                    (machine: any, machineIndex: number) => (
                                      <div
                                        key={machineIndex}
                                        className="text-xs text-gray-500 ml-2 space-y-1"
                                      >
                                        <div className="flex justify-between">
                                          <span>Unit:</span>
                                          <span>
                                            {machine.unit || "No unit"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Machine ID:</span>
                                          <span>{machine.machineId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Machine Code:</span>
                                          <span>
                                            {machine.machineCode || "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Machine Type:</span>
                                          <span>{machine.machineType}</span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            {/* Step Details Section */}
                            {stepDetails && stepDetails.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Step Details:
                                </p>
                                {stepDetails.map(
                                  (detail: any, detailIndex: number) => (
                                    <div
                                      key={detailIndex}
                                      className="text-xs text-gray-500 ml-2 space-y-1"
                                    >
                                      {/* Paper Store Details */}
                                      {step.stepName === "PaperStore" && (
                                        <>
                                          {detail.sheetSize && (
                                            <div className="flex justify-between">
                                              <span>Sheet Size:</span>
                                              <span>{detail.sheetSize}</span>
                                            </div>
                                          )}
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.available && (
                                            <div className="flex justify-between">
                                              <span>Available:</span>
                                              <span>{detail.available}</span>
                                            </div>
                                          )}
                                          {detail.issuedDate && (
                                            <div className="flex justify-between">
                                              <span>Issued Date:</span>
                                              <span>
                                                {new Date(
                                                  detail.issuedDate
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                          )}
                                          {detail.mill && (
                                            <div className="flex justify-between">
                                              <span>Mill:</span>
                                              <span>{detail.mill}</span>
                                            </div>
                                          )}
                                          {detail.gsm && (
                                            <div className="flex justify-between">
                                              <span>GSM:</span>
                                              <span>{detail.gsm}</span>
                                            </div>
                                          )}
                                          {detail.quality && (
                                            <div className="flex justify-between">
                                              <span>Quality:</span>
                                              <span>{detail.quality}</span>
                                            </div>
                                          )}
                                          {detail.extraMargin && (
                                            <div className="flex justify-between">
                                              <span>Extra Margin:</span>
                                              <span>{detail.extraMargin}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Printing Details */}
                                      {step.stepName === "PrintingDetails" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.machine && (
                                            <div className="flex justify-between">
                                              <span>Machine:</span>
                                              <span>{detail.machine}</span>
                                            </div>
                                          )}
                                          {detail.oprName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.oprName}</span>
                                            </div>
                                          )}
                                          {detail.inksUsed && (
                                            <div className="flex justify-between">
                                              <span>Inks Used:</span>
                                              <span>{detail.inksUsed}</span>
                                            </div>
                                          )}
                                          {detail.coatingType && (
                                            <div className="flex justify-between">
                                              <span>Coating Type:</span>
                                              <span>{detail.coatingType}</span>
                                            </div>
                                          )}
                                          {detail.noOfColours && (
                                            <div className="flex justify-between">
                                              <span>No. of Colours:</span>
                                              <span>{detail.noOfColours}</span>
                                            </div>
                                          )}
                                          {detail.extraSheets && (
                                            <div className="flex justify-between">
                                              <span>Extra Sheets:</span>
                                              <span>{detail.extraSheets}</span>
                                            </div>
                                          )}
                                          {detail.separateSheets && (
                                            <div className="flex justify-between">
                                              <span>Separate Sheets:</span>
                                              <span>
                                                {detail.separateSheets}
                                              </span>
                                            </div>
                                          )}
                                          {detail.wastage && (
                                            <div className="flex justify-between">
                                              <span>Wastage:</span>
                                              <span>{detail.wastage}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Corrugation Details */}
                                      {step.stepName === "Corrugation" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.machineNo && (
                                            <div className="flex justify-between">
                                              <span>Machine No:</span>
                                              <span>{detail.machineNo}</span>
                                            </div>
                                          )}
                                          {detail.oprName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.oprName}</span>
                                            </div>
                                          )}
                                          {detail.flute && (
                                            <div className="flex justify-between">
                                              <span>Flute:</span>
                                              <span>{detail.flute}</span>
                                            </div>
                                          )}
                                          {detail.size && (
                                            <div className="flex justify-between">
                                              <span>Size:</span>
                                              <span>{detail.size}</span>
                                            </div>
                                          )}
                                          {detail.gsm1 && (
                                            <div className="flex justify-between">
                                              <span>GSM 1:</span>
                                              <span>{detail.gsm1}</span>
                                            </div>
                                          )}
                                          {detail.gsm2 && (
                                            <div className="flex justify-between">
                                              <span>GSM 2:</span>
                                              <span>{detail.gsm2}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {/* {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )} */}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Flute Laminate Details */}
                                      {step.stepName ===
                                        "FluteLaminateBoardConversion" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.film && (
                                            <div className="flex justify-between">
                                              <span>Film:</span>
                                              <span>{detail.film}</span>
                                            </div>
                                          )}
                                          {detail.adhesive && (
                                            <div className="flex justify-between">
                                              <span>Adhesive:</span>
                                              <span>{detail.adhesive}</span>
                                            </div>
                                          )}
                                          {detail.wastage && (
                                            <div className="flex justify-between">
                                              <span>Wastage:</span>
                                              <span>{detail.wastage}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Punching Details */}
                                      {step.stepName === "Punching" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.machine && (
                                            <div className="flex justify-between">
                                              <span>Machine:</span>
                                              <span>{detail.machine}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.die && (
                                            <div className="flex justify-between">
                                              <span>Die:</span>
                                              <span>{detail.die}</span>
                                            </div>
                                          )}
                                          {detail.wastage && (
                                            <div className="flex justify-between">
                                              <span>Wastage:</span>
                                              <span>{detail.wastage}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Side Flap Pasting Details */}
                                      {step.stepName === "SideFlapPasting" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.machineNo && (
                                            <div className="flex justify-between">
                                              <span>Machine No:</span>
                                              <span>{detail.machineNo}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.adhesive && (
                                            <div className="flex justify-between">
                                              <span>Adhesive:</span>
                                              <span>{detail.adhesive}</span>
                                            </div>
                                          )}
                                          {detail.wastage && (
                                            <div className="flex justify-between">
                                              <span>Wastage:</span>
                                              <span>{detail.wastage}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Quality Dept Details */}
                                      {step.stepName === "QualityDept" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.checkedBy && (
                                            <div className="flex justify-between">
                                              <span>Checked By:</span>
                                              <span>{detail.checkedBy}</span>
                                            </div>
                                          )}
                                          {detail.rejectedQty && (
                                            <div className="flex justify-between">
                                              <span>Rejected Qty:</span>
                                              <span className="text-red-600">
                                                {detail.rejectedQty}
                                              </span>
                                            </div>
                                          )}
                                          {detail.reasonForRejection && (
                                            <div className="flex justify-between">
                                              <span>Reason for Rejection:</span>
                                              <span className="text-red-600">
                                                {detail.reasonForRejection}
                                              </span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Dispatch Process Details */}
                                      {step.stepName === "DispatchProcess" && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.balanceQty && (
                                            <div className="flex justify-between">
                                              <span>Balance Qty:</span>
                                              <span>{detail.balanceQty}</span>
                                            </div>
                                          )}
                                          {detail.dispatchNo && (
                                            <div className="flex justify-between">
                                              <span>Dispatch No:</span>
                                              <span>{detail.dispatchNo}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.dispatchDate && (
                                            <div className="flex justify-between">
                                              <span>Dispatch Date:</span>
                                              <span>
                                                {new Date(
                                                  detail.dispatchDate
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.holdRemark && (
                                            <div className="flex justify-between">
                                              <span>Hold Remark:</span>
                                              <span className="text-red-600">
                                                {detail.holdRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.completeRemark && (
                                            <div className="flex justify-between">
                                              <span>Complete Remark:</span>
                                              <span className="text-green-600">
                                                {detail.completeRemark}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Generic Details for any step not covered above */}
                                      {![
                                        "PaperStore",
                                        "PrintingDetails",
                                        "Corrugation",
                                        "FluteLaminateBoardConversion",
                                        "Punching",
                                        "SideFlapPasting",
                                        "QualityDept",
                                        "DispatchProcess",
                                      ].includes(step.stepName) && (
                                        <>
                                          {detail.quantity && (
                                            <div className="flex justify-between">
                                              <span>Quantity:</span>
                                              <span>{detail.quantity}</span>
                                            </div>
                                          )}
                                          {detail.shift && (
                                            <div className="flex justify-between">
                                              <span>Shift:</span>
                                              <span>{detail.shift}</span>
                                            </div>
                                          )}
                                          {detail.operatorName && (
                                            <div className="flex justify-between">
                                              <span>Operator:</span>
                                              <span>{detail.operatorName}</span>
                                            </div>
                                          )}
                                          {detail.status && (
                                            <div className="flex justify-between">
                                              <span>Status:</span>
                                              <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                  detail.status === "hold"
                                                    ? "bg-red-100 text-red-800"
                                                    : detail.status === "start"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : detail.status === "accept"
                                                    ? "bg-green-100 text-green-800"
                                                    : detail.status ===
                                                      "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                {detail.status}
                                              </span>
                                            </div>
                                          )}
                                          {detail.remarks && (
                                            <div className="flex justify-between">
                                              <span>Remarks:</span>
                                              <span>{detail.remarks}</span>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedJobModal;
