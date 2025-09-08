// src/Components/Roles/Planner/GenericStepForm.tsx
import React, { useState, useEffect } from 'react';
import { type JobPlanStep, type PrintingDetailsPayload, type FluteLaminationPayload, type PunchingPayload, type FlapPastingPayload, type QCDetailsPayload, type DispatchDetailsPayload, type CorrugationPayload } from '../Types/job.ts'; // Import all relevant payloads
import { CheckCircle, PlayCircle, Pencil, Eye } from "lucide-react"; // ADDED: Icon imports

interface GenericStepFormProps {
  jobPlanId: number;
  nrcJobNo: string;
  step: JobPlanStep;
  onCompleteWork: (payload: any, endpoint: string, empId: string) => Promise<void>; // Payload type will be dynamic
  onClose: () => void;
  isReadOnly: boolean;
  // CORRECTED: Added 'status' to the allowed properties
  onUpdateStepProperty: (stepNo: number, property: 'startDate' | 'endDate' | 'user' | 'status', value: string | null) => Promise<void>;
}

const GenericStepForm: React.FC<GenericStepFormProps> = ({
  jobPlanId, // jobPlanId is used in onCompleteWork indirectly via nrcJobNo and step.id
  nrcJobNo,
  step,
  onCompleteWork,
  onClose,
  isReadOnly,
  onUpdateStepProperty
}) => {
  // Removed toDateInput and toISOString as they are not used within this component's JSX or direct logic.
  // If needed, they should be defined in a utility file or passed as props.

  // State for common fields
  const [qtySheet, setQtySheet] = useState<string | number>('');
  const [empId, setEmpId] = useState<string>(step.user || ''); // Emp Id maps to 'user' in JobPlanStep
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for step-specific fields
  const [stepSpecificFormData, setStepSpecificFormData] = useState<any>({});

  // States for tick/cross buttons
  const [isTickButtonDisabled, setIsTickButtonDisabled] = useState(false);
  const [isCrossButtonDisabled, setIsCrossButtonDisabled] = useState(false);
  const [isTickButtonLoading, setIsTickButtonLoading] = useState(false);
  const [isCrossButtonLoading, setIsCrossButtonLoading] = useState(false);


  useEffect(() => {
    // Helper to format date strings from ISO to YYYY-MM-DD for input type="date"
    const toDateInput = (isoDateString: string | null | undefined) => {
      if (!isoDateString) return '';
      try {
        return new Date(isoDateString).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    // Initialize common fields
    // Assuming quantity field is named 'quantity' in step-specific payloads for consistency
    // This part would ideally fetch existing step-specific details if editing
    // For now, initializing based on common fields.
    if (step.stepName === 'PrintingDetails' && step.printingDetails) {
      setQtySheet(step.printingDetails.postPrintingFinishingOkQty || '');
      setStepSpecificFormData({
        oprName: step.printingDetails.oprName || '',
        wastage: step.printingDetails.wastage || '',
        machine: step.printingDetails.machine || '',
        date: toDateInput(step.printingDetails.date),
        shift: step.printingDetails.shift || '',
        noOfColours: step.printingDetails.noOfColours || '',
        inksUsed: step.printingDetails.inksUsed || '',
        coatingType: step.printingDetails.coatingType || '',
        separateSheets: step.printingDetails.separateSheets || false,
        extraSheets: step.printingDetails.extraSheets || 0,
      });
    } else if (step.stepName === 'Corrugation' && step.corrugationDetails) {
      setQtySheet(step.corrugationDetails.noOfSheets || '');
      setStepSpecificFormData({
        date: toDateInput(step.corrugationDetails.date),
        shift: step.corrugationDetails.shift || '',
        oprName: step.corrugationDetails.oprName || '',
        machineNo: step.corrugationDetails.machineNo || '',
        size: step.corrugationDetails.size || '',
        gsm1: step.corrugationDetails.gsm1 || '',
        gsm2: step.corrugationDetails.gsm2 || '',
        flute: step.corrugationDetails.flute || '',
        remarks: step.corrugationDetails.remarks || '',
        qcCheckSignBy: step.corrugationDetails.qcCheckSignBy || '',
      });
    } // Add other step types here
    else if (step.stepName === 'FluteLamination' && step.fluteLaminationDetails) {
      setQtySheet(step.fluteLaminationDetails.okQty || '');
      setStepSpecificFormData({
        date: toDateInput(step.fluteLaminationDetails.date),
        shift: step.fluteLaminationDetails.shift || '',
        operatorName: step.fluteLaminationDetails.operatorName || '',
        film: step.fluteLaminationDetails.film || '',
        qcCheckSignBy: step.fluteLaminationDetails.qcCheckSignBy || '',
        adhesive: step.fluteLaminationDetails.adhesive || '',
        wastage: step.fluteLaminationDetails.wastage || '',
      });
    }
    else if (step.stepName === 'Punching' && step.punchingDetails) {
      setQtySheet(step.punchingDetails.okQty || '');
      setStepSpecificFormData({
        date: toDateInput(step.punchingDetails.date),
        shift: step.punchingDetails.shift || '',
        operatorName: step.punchingDetails.operatorName || '',
        machine: step.punchingDetails.machine || '',
        die: step.punchingDetails.die || '',
        wastage: step.punchingDetails.wastage || '',
        remarks: step.punchingDetails.remarks || '',
        qcCheckSignBy: step.punchingDetails.qcCheckSignBy || '',
      });
    }
    else if (step.stepName === 'FlapPasting' && step.flapPastingDetails) {
      setQtySheet(step.flapPastingDetails.quantity || '');
      setStepSpecificFormData({
        date: toDateInput(step.flapPastingDetails.date),
        shift: step.flapPastingDetails.shift || '',
        operatorName: step.flapPastingDetails.operatorName || '',
        machineNo: step.flapPastingDetails.machineNo || '',
        adhesive: step.flapPastingDetails.adhesive || '',
        wastage: step.flapPastingDetails.wastage || '',
        remarks: step.flapPastingDetails.remarks || '',
        qcCheckSignBy: step.flapPastingDetails.qcCheckSignBy || '',
      });
    }
    else if (step.stepName === 'QualityDept' && step.qcDetails) {
      setQtySheet(step.qcDetails.passQty || '');
      setStepSpecificFormData({
        date: toDateInput(step.qcDetails.date),
        shift: step.qcDetails.shift || '',
        operatorName: step.qcDetails.operatorName || '',
        checkedBy: step.qcDetails.checkedBy || '',
        rejectedQty: step.qcDetails.rejectedQty || '',
        reasonForRejection: step.qcDetails.reasonForRejection || '',
        remarks: step.qcDetails.remarks || '',
        qcCheckSignBy: step.qcDetails.qcCheckSignBy || '',
      });
    }
    else if (step.stepName === 'DispatchProcess' && step.dispatchDetails) {
      setQtySheet(step.dispatchDetails.noOfBoxes || '');
      setStepSpecificFormData({
        date: toDateInput(step.dispatchDetails.date),
        shift: step.dispatchDetails.shift || '',
        operatorName: step.dispatchDetails.operatorName || '',
        dispatchNo: step.dispatchDetails.dispatchNo || '',
        dispatchDate: toDateInput(step.dispatchDetails.dispatchDate),
        balanceQty: step.dispatchDetails.balanceQty || '',
        remarks: step.dispatchDetails.remarks || '',
        qcCheckSignBy: step.dispatchDetails.qcCheckSignBy || '',
      });
    }

    // Set tick button state based on startDate
    setIsTickButtonDisabled(!!step.startDate || isReadOnly);
    setIsCrossButtonDisabled(!!step.endDate || isReadOnly);

  }, [step, isReadOnly]);


  const handleStepSpecificChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    const { name, value, type } = e.target;
    setStepSpecificFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleTickClick = async () => {
    if (isTickButtonDisabled) return;
    setIsTickButtonLoading(true);
    setError(null);
    try {
      await onUpdateStepProperty(step.stepNo, 'startDate', new Date().toISOString());
      setIsTickButtonDisabled(true); // Disable after successful update
    } catch (err) {
      setError(`Failed to update start date: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsTickButtonLoading(false);
    }
  };

  const handleCrossClick = async () => {
    if (isCrossButtonDisabled) return;
    setIsCrossButtonLoading(true);
    setError(null);
    try {
      await onUpdateStepProperty(step.stepNo, 'endDate', new Date().toISOString());
      setIsCrossButtonDisabled(true); // Disable after successful update
    } catch (err) {
      setError(`Failed to update end date: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCrossButtonLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setError(null);
    setIsSubmitting(true);

    // Common required fields for all generic steps
    const commonRequiredFields = [qtySheet, empId];
    if (commonRequiredFields.some(field => field === '' || field === null || (typeof field === 'number' && isNaN(field)))) {
      setError('Quantity Sheet and Employee ID are required.');
      setIsSubmitting(false);
      return;
    }

    // Build PUT 2 Payload based on stepName
    let put2Payload: any;
    let put2Endpoint: string;

    // Helper to convert YYYY-MM-DD to ISO 8601 UTC string (needed here for payload construction)
    const toISOStringForPayload = (dateString: string | undefined | null) => {
      if (!dateString) return null;
      try {
        return new Date(dateString + 'T00:00:00.000Z').toISOString();
      } catch (e) {
        return null;
      }
    };


    const commonPut2Fields = {
      jobStepId: step.id,
      jobNrcJobNo: nrcJobNo,
      status: 'accept', // Status for PUT 2 payload
      quantity: Number(qtySheet), // Quantity from form
    };

    switch (step.stepName) {
      case 'PrintingDetails':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift || '',
          oprName: stepSpecificFormData.oprName,
          noOfColours: stepSpecificFormData.noOfColours || '',
          inksUsed: stepSpecificFormData.inksUsed || '',
          wastage: Number(stepSpecificFormData.wastage),
          machine: stepSpecificFormData.machine,
          postPrintingFinishingOkQty: Number(qtySheet) - Number(stepSpecificFormData.wastage || 0),
          coatingType: stepSpecificFormData.coatingType || '',
          separateSheets: stepSpecificFormData.separateSheets || false,
          extraSheets: stepSpecificFormData.extraSheets || 0,
          remarks: stepSpecificFormData.remarks || '',
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy || '',
        } as PrintingDetailsPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/printing-details/${nrcJobNo}`;
        break;
      case 'Corrugation':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift,
          oprName: stepSpecificFormData.oprName,
          machineNo: stepSpecificFormData.machineNo,
          size: stepSpecificFormData.size,
          gsm1: stepSpecificFormData.gsm1,
          gsm2: stepSpecificFormData.gsm2,
          flute: stepSpecificFormData.flute,
          noOfSheets: Number(qtySheet),
          remarks: stepSpecificFormData.remarks,
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy,
        } as CorrugationPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/corrugation/${nrcJobNo}`;
        break;
      case 'FluteLamination':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift,
          operatorName: stepSpecificFormData.operatorName,
          film: stepSpecificFormData.film,
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy,
          adhesive: stepSpecificFormData.adhesive,
          wastage: Number(stepSpecificFormData.wastage),
          okQty: Number(qtySheet) - Number(stepSpecificFormData.wastage || 0),
        } as FluteLaminationPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/flute-laminate-board-conversion/${nrcJobNo}`;
        break;
      case 'Punching':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift || '',
          operatorName: stepSpecificFormData.operatorName,
          machine: stepSpecificFormData.machine,
          die: stepSpecificFormData.die,
          wastage: Number(stepSpecificFormData.wastage),
          okQty: Number(qtySheet) - Number(stepSpecificFormData.wastage || 0),
          remarks: stepSpecificFormData.remarks,
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy || '',
        } as PunchingPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/punching/${nrcJobNo}`;
        break;
      case 'FlapPasting':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift,
          operatorName: stepSpecificFormData.operatorName,
          machineNo: stepSpecificFormData.machineNo,
          adhesive: stepSpecificFormData.adhesive,
          wastage: Number(stepSpecificFormData.wastage),
          remarks: stepSpecificFormData.remarks,
          user: empId, // Emp Id is passed here
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy || '',
        } as FlapPastingPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/side-flap-pasting/${nrcJobNo}`;
        break;
      case 'QualityDept':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift || '',
          operatorName: stepSpecificFormData.operatorName || '',
          checkedBy: stepSpecificFormData.checkedBy,
          passQty: Number(qtySheet) - Number(stepSpecificFormData.rejectedQty || 0),
          rejectedQty: Number(stepSpecificFormData.rejectedQty),
          reasonForRejection: stepSpecificFormData.reasonForRejection,
          remarks: stepSpecificFormData.remarks,
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy || '',
        } as QCDetailsPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/quality-dept/${nrcJobNo}`;
        break;
      case 'DispatchProcess':
        put2Payload = {
          ...commonPut2Fields,
          date: toISOStringForPayload(stepSpecificFormData.date) as string,
          shift: stepSpecificFormData.shift || '',
          operatorName: stepSpecificFormData.operatorName,
          dispatchNo: stepSpecificFormData.dispatchNo,
          dispatchDate: toISOStringForPayload(stepSpecificFormData.dispatchDate) as string,
          noOfBoxes: Number(qtySheet),
          balanceQty: Number(stepSpecificFormData.balanceQty),
          remarks: stepSpecificFormData.remarks,
          qcCheckSignBy: stepSpecificFormData.qcCheckSignBy || '',
        } as DispatchDetailsPayload;
        put2Endpoint = `https://nrprod.nrcontainers.com/api/dispatch-process/${nrcJobNo}`;
        break;
      default:
        setError('Unsupported step type for completion.');
        setIsSubmitting(false);
        return;
    }

    try {
      // Parallel API calls
      await Promise.all([
        // PUT 1: Update JobPlanStep properties (user, status, endDate)
        onUpdateStepProperty(step.stepNo, 'user', empId),
        onUpdateStepProperty(step.stepNo, 'status', 'stop'),
        onUpdateStepProperty(step.stepNo, 'endDate', new Date().toISOString()),

        // PUT 2: Update step-specific details
        onCompleteWork(put2Payload, put2Endpoint, empId), // Pass empId to onCompleteWork
      ]);
      onClose(); // Close modal after successful completion
    } catch (err) {
      setError(`Failed to complete work: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Render fields based on step.stepName
  const renderStepSpecificFields = () => {
    const commonInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed";

    const commonProps = {
      className: commonInputClasses,
      onChange: handleStepSpecificChange,
      disabled: isReadOnly,
      required: true,
    };

    switch (step.stepName) {
      case 'PrintingDetails':
        return (
          <>
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="operatorName" name="oprName" value={stepSpecificFormData.oprName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="wastage" className="block text-sm font-medium text-gray-700 mb-1">Wastage</label>
              <input type="number" id="wastage" name="wastage" value={stepSpecificFormData.wastage} {...commonProps} />
            </div>
            <div>
              <label htmlFor="machine" className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
              <input type="text" id="machine" name="machine" value={stepSpecificFormData.machine} {...commonProps} />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
          </>
        );
      case 'Corrugation':
        return (
          <>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <input type="text" id="shift" name="shift" value={stepSpecificFormData.shift} {...commonProps} />
            </div>
            <div>
              <label htmlFor="oprName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="oprName" name="oprName" value={stepSpecificFormData.oprName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="machineNo" className="block text-sm font-medium text-gray-700 mb-1">Machine No</label>
              <input type="text" id="machineNo" name="machineNo" value={stepSpecificFormData.machineNo} {...commonProps} />
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input type="text" id="size" name="size" value={stepSpecificFormData.size} {...commonProps} />
            </div>
            <div>
              <label htmlFor="gsm1" className="block text-sm font-medium text-gray-700 mb-1">GSM 1</label>
              <input type="text" id="gsm1" name="gsm1" value={stepSpecificFormData.gsm1} {...commonProps} />
            </div>
            <div>
              <label htmlFor="gsm2" className="block text-sm font-medium text-gray-700 mb-1">GSM 2</label>
              <input type="text" id="gsm2" name="gsm2" value={stepSpecificFormData.gsm2} {...commonProps} />
            </div>
            <div>
              <label htmlFor="flute" className="block text-sm font-medium text-gray-700 mb-1">Flute Type</label>
              <input type="text" id="flute" name="flute" value={stepSpecificFormData.flute} {...commonProps} />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" id="remarks" name="remarks" value={stepSpecificFormData.remarks} {...commonProps} />
            </div>
            <div>
              <label htmlFor="qcCheckSignBy" className="block text-sm font-medium text-gray-700 mb-1">QC Check Sign By</label>
              <input type="text" id="qcCheckSignBy" name="qcCheckSignBy" value={stepSpecificFormData.qcCheckSignBy} {...commonProps} />
            </div>
          </>
        );
      case 'FluteLamination':
        return (
          <>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <input type="text" id="shift" name="shift" value={stepSpecificFormData.shift} {...commonProps} />
            </div>
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="operatorName" name="operatorName" value={stepSpecificFormData.operatorName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="film" className="block text-sm font-medium text-gray-700 mb-1">Film Type</label>
              <input type="text" id="film" name="film" value={stepSpecificFormData.film} {...commonProps} />
            </div>
            <div>
              <label htmlFor="qcCheckSignBy" className="block text-sm font-medium text-gray-700 mb-1">QC Sign By</label>
              <input type="text" id="qcCheckSignBy" name="qcCheckSignBy" value={stepSpecificFormData.qcCheckSignBy} {...commonProps} />
            </div>
            <div>
              <label htmlFor="adhesive" className="block text-sm font-medium text-gray-700 mb-1">Adhesive</label>
              <input type="text" id="adhesive" name="adhesive" value={stepSpecificFormData.adhesive} {...commonProps} />
            </div>
            <div>
              <label htmlFor="wastage" className="block text-sm font-medium text-gray-700 mb-1">Wastage</label>
              <input type="number" id="wastage" name="wastage" value={stepSpecificFormData.wastage} {...commonProps} />
            </div>
          </>
        );
      case 'Punching':
        return (
          <>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="operatorName" name="operatorName" value={stepSpecificFormData.operatorName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="machine" className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
              <input type="text" id="machine" name="machine" value={stepSpecificFormData.machine} {...commonProps} />
            </div>
            <div>
              <label htmlFor="die" className="block text-sm font-medium text-gray-700 mb-1">Die Used</label>
              <input type="text" id="die" name="die" value={stepSpecificFormData.die} {...commonProps} />
            </div>
            <div>
              <label htmlFor="wastage" className="block text-sm font-medium text-gray-700 mb-1">Wastage</label>
              <input type="number" id="wastage" name="wastage" value={stepSpecificFormData.wastage} {...commonProps} />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" id="remarks" name="remarks" value={stepSpecificFormData.remarks} {...commonProps} />
            </div>
          </>
        );
      case 'FlapPasting':
        return (
          <>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <input type="text" id="shift" name="shift" value={stepSpecificFormData.shift} {...commonProps} />
            </div>
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="operatorName" name="operatorName" value={stepSpecificFormData.operatorName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="machineNo" className="block text-sm font-medium text-gray-700 mb-1">Machine No</label>
              <input type="text" id="machineNo" name="machineNo" value={stepSpecificFormData.machineNo} {...commonProps} />
            </div>
            <div>
              <label htmlFor="adhesive" className="block text-sm font-medium text-gray-700 mb-1">Adhesive</label>
              <input type="text" id="adhesive" name="adhesive" value={stepSpecificFormData.adhesive} {...commonProps} />
            </div>
            <div>
              <label htmlFor="wastage" className="block text-sm font-medium text-gray-700 mb-1">Wastage</label>
              <input type="number" id="wastage" name="wastage" value={stepSpecificFormData.wastage} {...commonProps} />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" id="remarks" name="remarks" value={stepSpecificFormData.remarks} {...commonProps} />
            </div>
          </>
        );
      case 'QualityDept':
        return (
          <>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <input type="text" id="shift" name="shift" value={stepSpecificFormData.shift} {...commonProps} />
            </div>
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="operatorName" name="operatorName" value={stepSpecificFormData.operatorName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="checkedBy" className="block text-sm font-medium text-gray-700 mb-1">Checked By</label>
              <input type="text" id="checkedBy" name="checkedBy" value={stepSpecificFormData.checkedBy} {...commonProps} />
            </div>
            <div>
              <label htmlFor="rejectedQty" className="block text-sm font-medium text-gray-700 mb-1">Reject Quantity</label>
              <input type="number" id="rejectedQty" name="rejectedQty" value={stepSpecificFormData.rejectedQty} {...commonProps} />
            </div>
            <div>
              <label htmlFor="reasonForRejection" className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
              <input type="text" id="reasonForRejection" name="reasonForRejection" value={stepSpecificFormData.reasonForRejection} {...commonProps} />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" id="remarks" name="remarks" value={stepSpecificFormData.remarks} {...commonProps} />
            </div>
            <div>
              <label htmlFor="qcCheckSignBy" className="block text-sm font-medium text-gray-700 mb-1">QC Check Sign By</label>
              <input type="text" id="qcCheckSignBy" name="qcCheckSignBy" value={stepSpecificFormData.qcCheckSignBy} {...commonProps} />
            </div>
          </>
        );
      case 'DispatchProcess':
        return (
          <>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" name="date" value={stepSpecificFormData.date} {...commonProps} />
            </div>
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
              <input type="text" id="operatorName" name="operatorName" value={stepSpecificFormData.operatorName} {...commonProps} />
            </div>
            <div>
              <label htmlFor="dispatchNo" className="block text-sm font-medium text-gray-700 mb-1">Dispatch No</label>
              <input type="text" id="dispatchNo" name="dispatchNo" value={stepSpecificFormData.dispatchNo} {...commonProps} />
            </div>
            <div>
              <label htmlFor="dispatchDate" className="block text-sm font-medium text-gray-700 mb-1">Dispatch Date</label>
              <input type="date" id="dispatchDate" name="dispatchDate" value={stepSpecificFormData.dispatchDate} {...commonProps} />
            </div>
            <div>
              <label htmlFor="balanceQty" className="block text-sm font-medium text-gray-700 mb-1">Balance Quantity</label>
              <input type="number" id="balanceQty" name="balanceQty" value={stepSpecificFormData.balanceQty} {...commonProps} />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" id="remarks" name="remarks" value={stepSpecificFormData.remarks} {...commonProps} />
            </div>
          </>
        );
      default:
        return <p className="text-gray-500 text-center">No specific fields for this step type.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">{step.stepName}</h2>
          <p className="text-gray-500 text-center mb-6">Update details for Job: {nrcJobNo}, Step: {step.stepNo}</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">{error}</div>}

            {/* Common Fields */}
            <div>
              <label htmlFor="qtySheet" className="block text-sm font-medium text-gray-700 mb-1">Qty Sheet</label>
              <input type="number" id="qtySheet" name="qtySheet" value={qtySheet} onChange={(e) => setQtySheet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="empId" className="block text-sm font-medium text-gray-700 mb-1">Emp Id</label>
              <input type="text" id="empId" name="empId" value={empId} onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] disabled:bg-gray-50 disabled:cursor-not-allowed" required
                disabled={isReadOnly} />
            </div>

            {/* Step-Specific Fields */}
            {renderStepSpecificFields()}

            {/* Control Buttons */}
            <div className="flex justify-center items-center gap-4 py-4">
              <button
                type="button"
                className={`p-3 rounded-full text-white shadow-md flex items-center justify-center transition-colors duration-200
                  ${isTickButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                onClick={handleTickClick}
                disabled={isTickButtonDisabled || isTickButtonLoading || isReadOnly}
              >
                {isTickButtonLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <CheckCircle className="h-6 w-6" />
                )}
              </button>
              <button
                type="button"
                className="p-3 rounded-full bg-blue-500 text-white shadow-md flex items-center justify-center cursor-not-allowed"
                disabled // Pause button is always disabled for now
              >
                <PlayCircle className="h-6 w-6" />
              </button>
              <button
                type="button"
                className={`p-3 rounded-full text-white shadow-md flex items-center justify-center transition-colors duration-200
                  ${isCrossButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={handleCrossClick}
                disabled={isCrossButtonDisabled || isCrossButtonLoading || isReadOnly}
              >
                {isCrossButtonLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <Eye className="h-6 w-6 rotate-45" /> // Using Eye icon rotated for cross
                )}
              </button>
            </div>

            {/* Status Display */}
            <div className="flex items-center justify-center text-sm font-medium text-gray-700 mt-2">
              <span className="text-orange-500 mr-2">!</span> Status: Started
            </div>
            <div className="text-center text-xs text-gray-500 mt-1">
              Started: {step.startDate ? new Date(step.startDate).toLocaleString() : 'N/A'}
            </div>


            {/* Complete Work / Close Buttons */}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-green-600 transition hover:cursor-pointer shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              disabled={isSubmitting || isReadOnly}
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
              {isSubmitting ? 'Completing...' : 'Complete Work'}
            </button>
            <button
              type="button"
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-base hover:bg-gray-300 transition hover:cursor-pointer shadow-md mt-2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenericStepForm;