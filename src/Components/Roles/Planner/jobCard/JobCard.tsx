// src/Components/Roles/Planner/jobCard/JobCard.tsx
import React from "react";
import { type Job } from "../Types/job.ts";

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void; // Original click to open full details
  // Make these props optional
  onInitiateJobClick?: (job: Job) => void; // Optional prop for the initiate job button
  jobCompletionStatus?:
    | "artwork_pending"
    | "po_pending"
    | "more_info_pending"
    | "completed"; // Optional status from parent
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  onInitiateJobClick,
  jobCompletionStatus,
}) => {
  const statusColor = job.status === "ACTIVE" ? "bg-green-500" : "bg-red-500";

  // Determine button text and color based on completion status, ONLY if props are provided
  let buttonText = "";
  let buttonColorClass = "";
  let buttonAction: (() => void) | undefined;
  let buttonDisabled = false;
  let showConditionalButton = false; // Flag to control rendering

  if (onInitiateJobClick && jobCompletionStatus) {
    // Only show conditional button if both props are present
    showConditionalButton = true;
    if (jobCompletionStatus === "completed") {
      buttonText = "Job initiated";
      buttonColorClass = "bg-green-600 hover:bg-green-700";
      buttonDisabled = true; // Job is already initiated, button is just an indicator
    } else {
      buttonText = "Fill details to start the job";
      buttonColorClass =
        "bg-orange-500 hover:bg-orange-600 hover:cursor-pointer";
      buttonAction = () => onInitiateJobClick(job);
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full"
      // Original onClick to open full details
      onClick={() => onClick(job)}
    >
      <div className="relative flex justify-between items-start mb-2">
        <div className="flex flex-col pr-12">
          <p className="text-sm text-gray-500">Customer Name</p>
          <h3 className="text-lg font-semibold text-gray-800 pt-2">
            {job.customerName}
          </h3>
        </div>

        <span
          className={`absolute top-1 right-1 px-3 py-1 text-xs font-semibold text-white rounded-full ${statusColor} `}
        >
          {job.status}
        </span>
      </div>

      <div className="flex flex-col mb-2">
        <p className="text-sm text-gray-500">Style Item SKU</p>
        <p className="text-base text-gray-700">{job.styleItemSKU}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
        {" "}
        {/* Added mb-4 for button spacing */}
        <div>
          <p className="text-gray-500">NRC Job No:</p>
          <p className="font-medium">{job.nrcJobNo}</p>
        </div>
        <div>
          <p className="text-gray-500">Flute Type:</p>
          <p className="font-medium">{job.fluteType || "N/A"}</p>
        </div>
        <div>
          <p className="text-gray-500">Box Dimensions:</p>
          <p className="font-medium">{job.boxDimensions}</p>
        </div>
        <div>
          <p className="text-gray-500">Pre Rate:</p>
          <p className="font-medium">
            {job.preRate !== null ? job.preRate : "N/A"}
          </p>
        </div>
      </div>

      {/* Conditional Button - only render if showConditionalButton is true */}
      {showConditionalButton && (
        <button
          className={`w-full text-white py-2 rounded-md font-semibold transition duration-300 ${buttonColorClass}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card's onClick from firing
            if (buttonAction) buttonAction();
          }}
          disabled={buttonDisabled}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default JobCard;
