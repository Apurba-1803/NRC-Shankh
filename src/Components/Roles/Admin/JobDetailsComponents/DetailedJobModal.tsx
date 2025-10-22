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
import logoImage from "../../../../assets/Login/logo.jpg";

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
  jobPlanningDetails?: {
    purchaseOrderDetails?: any[];
    allStepsDetails?: any[];
  };
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

  // Helper function to convert logo to base64
  const getLogoAsBase64 = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error("Failed to load logo"));
      img.src = logoImage;
    });
  };

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

      // Add NRC Logo
      try {
        // Convert logo to base64 and add to PDF
        const logoBase64 = await getLogoAsBase64();
        pdf.addImage(logoBase64, "JPEG", 17, yPosition + 2, 21, 11);
      } catch (error) {
        console.warn("Could not load logo, using text fallback:", error);
        // Fallback to text if logo fails
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        pdf.text("NRC", 27.5, yPosition + 8, { align: "center" });
      }

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
          job.jobDetails?.customerName || job.jobDetails?.company || "N/A"
        )}`,
        20,
        yPosition
      );
      pdf.text(
        `Job Name : ${String(
          job.nrcJobNo || job.jobDetails?.nrcJobNo || "N/A"
        )}`,
        20,
        yPosition + 6
      );
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
      // Handle new data structure: jobPlanningDetails.purchaseOrderDetails (array)
      // or fallback to old structure: job.purchaseOrderDetails
      let poDetailsArray =
        job.jobPlanningDetails?.purchaseOrderDetails ||
        job.purchaseOrderDetails;
      const poDetails = Array.isArray(poDetailsArray)
        ? poDetailsArray[0]
        : poDetailsArray;

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
        if (yPosition > pageHeight - 80) {
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

        // Create a beautiful step box
        const stepBoxHeight = 25;
        const stepBoxWidth = pageWidth - 30;
        const stepBoxX = 15;

        // Draw step box with border
        drawRect(
          stepBoxX,
          yPosition,
          stepBoxWidth,
          stepBoxHeight,
          colors.white
        );
        drawBorder(stepBoxX, yPosition, stepBoxWidth, stepBoxHeight, 0.3);

        // Add step name on the left
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(
          colors.primary[0],
          colors.primary[1],
          colors.primary[2]
        );
        pdf.text(
          step.stepName.replace(/([a-z])([A-Z])/g, "$1 $2"),
          stepBoxX + 5,
          yPosition + 8
        );

        // Add status on the right
        const statusText = step.status || "planned";
        const statusColor =
          statusText === "completed"
            ? [34, 197, 94]
            : statusText === "in-progress"
            ? [251, 191, 36]
            : [107, 114, 128];

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(
          statusText.toUpperCase(),
          stepBoxX + stepBoxWidth - 5,
          yPosition + 8,
          { align: "right" }
        );

        // Add timeline info below
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(
          colors.darkGray[0],
          colors.darkGray[1],
          colors.darkGray[2]
        );

        let timelineText = "";
        if (step.startDate) {
          timelineText += `Start: ${new Date(
            step.startDate
          ).toLocaleDateString()}`;
        }
        if (step.endDate) {
          timelineText += timelineText
            ? ` | End: ${new Date(step.endDate).toLocaleDateString()}`
            : `End: ${new Date(step.endDate).toLocaleDateString()}`;
        }
        if (timelineText) {
          pdf.text(timelineText, stepBoxX + 5, yPosition + 15);
        }

        // Add step number on the right side
        if (step.stepNo) {
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(
            colors.primary[0],
            colors.primary[1],
            colors.primary[2]
          );
          pdf.text(
            `Step ${step.stepNo}`,
            stepBoxX + stepBoxWidth - 5,
            yPosition + 15,
            { align: "right" }
          );
        }

        yPosition += stepBoxHeight + 10;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

        // Machine Details Section (if available) - in a separate box
        if (step.machineDetails && step.machineDetails.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          // Create machine details box
          const machineBoxHeight = 15 + step.machineDetails.length * 12;
          const machineBoxWidth = pageWidth - 30;
          const machineBoxX = 15;

          drawRect(
            machineBoxX,
            yPosition,
            machineBoxWidth,
            machineBoxHeight,
            colors.lightGray
          );
          drawBorder(
            machineBoxX,
            yPosition,
            machineBoxWidth,
            machineBoxHeight,
            0.3
          );

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(
            colors.primary[0],
            colors.primary[1],
            colors.primary[2]
          );
          pdf.text("Machine Details:", machineBoxX + 5, yPosition + 6);
          yPosition += 10;

          step.machineDetails.forEach((machine: any) => {
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(
              colors.darkGray[0],
              colors.darkGray[1],
              colors.darkGray[2]
            );

            let machineInfo = "";
            if (machine.unit) machineInfo += `Unit: ${machine.unit} | `;
            if (machine.machineId) machineInfo += `ID: ${machine.machineId} | `;
            if (machine.machineCode)
              machineInfo += `Code: ${machine.machineCode} | `;
            if (machine.machineType)
              machineInfo += `Type: ${machine.machineType}`;

            // Remove trailing " | " if exists
            machineInfo = machineInfo.replace(/\s\|\s$/, "");

            if (machineInfo) {
              pdf.text(machineInfo, machineBoxX + 5, yPosition);
              yPosition += 4;
            }
          });

          yPosition += 5;
        }

        // Step Details Section (if available) - in a separate box
        const stepDetails = getStepDetailsFromStep(step);
        if (stepDetails && stepDetails.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = 20;
          }

          // Create step details box
          const detailsBoxHeight = 20 + stepDetails.length * 15;
          const detailsBoxWidth = pageWidth - 30;
          const detailsBoxX = 15;

          drawRect(
            detailsBoxX,
            yPosition,
            detailsBoxWidth,
            detailsBoxHeight,
            [248, 250, 252]
          ); // Very light gray
          drawBorder(
            detailsBoxX,
            yPosition,
            detailsBoxWidth,
            detailsBoxHeight,
            0.3
          );

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(
            colors.primary[0],
            colors.primary[1],
            colors.primary[2]
          );
          pdf.text("Step Details:", detailsBoxX + 5, yPosition + 6);
          yPosition += 10;

          stepDetails.forEach((detail: any) => {
            // Create a compact details format
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(
              colors.darkGray[0],
              colors.darkGray[1],
              colors.darkGray[2]
            );

            // Collect all relevant fields for this step
            let detailFields: string[] = [];

            // Display step-specific fields exactly as in UI
            if (step.stepName === "PaperStore") {
              if (detail.sheetSize)
                detailFields.push(`Sheet Size: ${detail.sheetSize}`);
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.available)
                detailFields.push(`Available: ${detail.available}`);
              if (detail.issuedDate)
                detailFields.push(
                  `Issued: ${new Date(detail.issuedDate).toLocaleDateString()}`
                );
              if (detail.mill) detailFields.push(`Mill: ${detail.mill}`);
              if (detail.gsm) detailFields.push(`GSM: ${detail.gsm}`);
              if (detail.quality)
                detailFields.push(`Quality: ${detail.quality}`);
              if (detail.extraMargin)
                detailFields.push(`Extra Margin: ${detail.extraMargin}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "PrintingDetails") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.machine)
                detailFields.push(`Machine: ${detail.machine}`);
              if (detail.oprName)
                detailFields.push(`Operator: ${detail.oprName}`);
              if (detail.inksUsed)
                detailFields.push(`Inks: ${detail.inksUsed}`);
              if (detail.coatingType)
                detailFields.push(`Coating: ${detail.coatingType}`);
              if (detail.noOfColours)
                detailFields.push(`Colors: ${detail.noOfColours}`);
              if (detail.extraSheets)
                detailFields.push(`Extra Sheets: ${detail.extraSheets}`);
              if (detail.separateSheets)
                detailFields.push(`Separate: ${detail.separateSheets}`);
              if (detail.wastage)
                detailFields.push(`Wastage: ${detail.wastage}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "Corrugation") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.machineNo)
                detailFields.push(`Machine: ${detail.machineNo}`);
              if (detail.oprName)
                detailFields.push(`Operator: ${detail.oprName}`);
              if (detail.flute) detailFields.push(`Flute: ${detail.flute}`);
              if (detail.size) detailFields.push(`Size: ${detail.size}`);
              if (detail.gsm1) detailFields.push(`GSM1: ${detail.gsm1}`);
              if (detail.gsm2) detailFields.push(`GSM2: ${detail.gsm2}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "FluteLaminateBoardConversion") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.film) detailFields.push(`Film: ${detail.film}`);
              if (detail.adhesive)
                detailFields.push(`Adhesive: ${detail.adhesive}`);
              if (detail.wastage)
                detailFields.push(`Wastage: ${detail.wastage}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "Punching") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.machine)
                detailFields.push(`Machine: ${detail.machine}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.die) detailFields.push(`Die: ${detail.die}`);
              if (detail.wastage)
                detailFields.push(`Wastage: ${detail.wastage}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "SideFlapPasting") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.machineNo)
                detailFields.push(`Machine: ${detail.machineNo}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.adhesive)
                detailFields.push(`Adhesive: ${detail.adhesive}`);
              if (detail.wastage)
                detailFields.push(`Wastage: ${detail.wastage}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "QualityDept") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.checkedBy)
                detailFields.push(`Checked By: ${detail.checkedBy}`);
              if (detail.rejectedQty)
                detailFields.push(`Rejected: ${detail.rejectedQty}`);
              if (detail.reasonForRejection)
                detailFields.push(`Reason: ${detail.reasonForRejection}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else if (step.stepName === "DispatchProcess") {
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.balanceQty)
                detailFields.push(`Balance: ${detail.balanceQty}`);
              if (detail.dispatchNo)
                detailFields.push(`Dispatch No: ${detail.dispatchNo}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.dispatchDate)
                detailFields.push(
                  `Dispatch Date: ${new Date(
                    detail.dispatchDate
                  ).toLocaleDateString()}`
                );
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.holdRemark)
                detailFields.push(`Hold: ${detail.holdRemark}`);
              if (detail.completeRemark)
                detailFields.push(`Complete: ${detail.completeRemark}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            } else {
              // Generic fields for other steps
              if (detail.quantity) detailFields.push(`Qty: ${detail.quantity}`);
              if (detail.shift) detailFields.push(`Shift: ${detail.shift}`);
              if (detail.operatorName)
                detailFields.push(`Operator: ${detail.operatorName}`);
              if (detail.status) detailFields.push(`Status: ${detail.status}`);
              if (detail.remarks)
                detailFields.push(`Remarks: ${detail.remarks}`);
            }

            // Render the collected fields in a compact format
            if (detailFields.length > 0) {
              // Split fields into two columns for better space utilization
              const leftFields = detailFields.slice(
                0,
                Math.ceil(detailFields.length / 2)
              );
              const rightFields = detailFields.slice(
                Math.ceil(detailFields.length / 2)
              );

              // Render left column
              leftFields.forEach((field, index) => {
                pdf.text(field, detailsBoxX + 5, yPosition + index * 4);
              });

              // Render right column
              rightFields.forEach((field, index) => {
                pdf.text(
                  field,
                  detailsBoxX + detailsBoxWidth / 2 + 5,
                  yPosition + index * 4
                );
              });

              yPosition +=
                Math.max(leftFields.length, rightFields.length) * 4 + 3;
            }
          });

          yPosition += 10; // Space after step details
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
        `NRC_Job_${(
          job.nrcJobNo ||
          job.jobDetails?.nrcJobNo ||
          "Unknown"
        ).replace(/[^a-zA-Z0-9]/g, "_")}_${
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
              <h2 className="text-2xl font-bold">
                {job.nrcJobNo || job.jobDetails?.nrcJobNo || "N/A"}
              </h2>
              <p className="text-blue-100">
                {job.jobDetails?.customerName ||
                  job.jobDetails?.company ||
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
                        {job.jobDetails.styleItemSKU ||
                          job.jobDetails.styleId ||
                          "N/A"}
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
                        Flute Type:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.fluteType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        No. of Colors:
                      </span>
                      <span className="text-gray-900">
                        {job.jobDetails.noOfColor || "N/A"}
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
              {(job.purchaseOrderDetails ||
                job.jobPlanningDetails?.purchaseOrderDetails) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Purchase Order Details
                  </h3>
                  {(() => {
                    // Handle new data structure: jobPlanningDetails.purchaseOrderDetails (array)
                    // or fallback to old structure: job.purchaseOrderDetails
                    let poDetailsArray =
                      job.jobPlanningDetails?.purchaseOrderDetails ||
                      job.purchaseOrderDetails;

                    // Handle both array and object formats
                    const poDetails = Array.isArray(poDetailsArray)
                      ? poDetailsArray[0]
                      : poDetailsArray;

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
