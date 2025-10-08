# Bulk Job Planning Fix - Using Same Structure as Single Job Planning

## Problem

Bulk job planning was saving data **incorrectly** with a different structure than single job planning, causing issues in the backend.

**Issue:** Bulk job planning was sending a complex object with `jobPlans` array and legacy fields, while single job planning sends a simple, clean structure that the backend expects.

## Root Cause

### ❌ BEFORE (Incorrect Structure)

```typescript
// Bulk job planning was sending:
const bulkJobPlanningData = {
  jobPlans: [
    {
      nrcJobNo: "...",
      poId: 123,
      jobDemand: "medium",
      steps: [...]
    },
    // ... more job plans
  ],
  poIds: [...],
  nrcJobNos: [...],
  jobDemand: "medium",
  steps: [...],
  selectedMachines: [...],
  stepMachines: {...}
};

// Sent to backend AS ONE CALL
await onSave(bulkJobPlanningData);
```

**Problem:** Backend expects individual job planning objects, not a bulk wrapper!

### ✅ AFTER (Correct Structure - Same as Single)

```typescript
// Single job planning sends:
const jobPlanningData = {
  nrcJobNo: "NRC-001",
  jobDemand: "medium",
  purchaseOrderId: 123,
  steps: [
    {
      jobStepId: 1,
      stepNo: 1,
      stepName: "Printing",
      machineDetails: [
        {
          id: "...",
          unit: "Unit 1",
          machineCode: "MK-PR01",
          machineType: "Printing",
        },
        {
          id: "...",
          unit: "Unit 1",
          machineCode: "MK-PR02",
          machineType: "Printing",
        },
      ],
      status: "planned",
      startDate: null,
      endDate: null,
      user: null,
      createdAt: "...",
      updatedAt: "...",
    },
  ],
};
```

**Now bulk does the SAME THING, just in a loop:**

```typescript
// Loop through each PO
for (const po of filteredPOs) {
  const jobPlanningData = {
    nrcJobNo: po.jobNrcJobNo || po.job?.nrcJobNo,
    jobDemand: jobDemand,
    purchaseOrderId: po.id,
    steps: selectedSteps.map((step, stepIndex) => {
      const assignedMachineIds = stepMachines[step.stepName] || [];
      const assignedMachines = assignedMachineIds
        .map((machineId) => allMachines.find((m) => m.id === machineId))
        .filter(Boolean) as Machine[];

      const machineDetails = assignedMachines.map((machine) => ({
        id: machine.id,
        unit: po.unit || machine.unit || "Unit 1",
        machineCode: machine.machineCode,
        machineType: machine.machineType,
      }));

      return {
        jobStepId: stepIndex + 1,
        stepNo: step.stepNo || stepIndex + 1,
        stepName: step.stepName,
        machineDetails: machineDetails,
        status: "planned" as const,
        startDate: null,
        endDate: null,
        user: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),
  };

  // Save each job plan individually (SAME as single job planning)
  await onSave(jobPlanningData);
}
```

## Solution

**Changed bulk job planning to call `onSave()` MULTIPLE TIMES (once per PO) instead of trying to send all POs in one complex object.**

### Key Changes in `BulkJobPlanning.tsx`

1. **Removed the complex `bulkJobPlanningData` wrapper**
2. **Added a `for` loop to process each PO individually**
3. **Each iteration creates the EXACT SAME structure as single job planning**
4. **Calls `onSave()` for each PO separately**

## Data Flow Comparison

### Single Job Planning

```
User selects 1 PO
   ↓
Selects steps + machines
   ↓
Creates jobPlanningData object
   ↓
Calls onSave(jobPlanningData) ONCE
   ↓
Backend creates 1 job planning ✅
```

### Bulk Job Planning (BEFORE) ❌

```
User selects 3 POs
   ↓
Selects steps + machines
   ↓
Creates bulkJobPlanningData with jobPlans array
   ↓
Calls onSave(bulkJobPlanningData) ONCE
   ↓
Backend confused by structure ❌
```

### Bulk Job Planning (AFTER) ✅

```
User selects 3 POs
   ↓
Selects steps + machines
   ↓
Loop through each PO:
  - Creates jobPlanningData object (SAME as single)
  - Calls onSave(jobPlanningData)
   ↓
Backend creates 3 job plannings ✅
```

## Code Changes

### Location: `Nrc/src/Components/Roles/Planner/modal/BulkJobPlanning.tsx`

**Line 170-234:** Complete rewrite of the `handleSubmit` try block

#### BEFORE:

```typescript
try {
  const bulkJobPlanningData = {
    jobPlans: filteredPOs.map(po => ({ ... })),
    poIds: [...],
    nrcJobNos: [...],
    jobDemand: jobDemand,
    steps: [...],
    selectedMachines: [...],
    stepMachines: {...}
  };

  await onSave(bulkJobPlanningData); // One call with complex object
}
```

#### AFTER:

```typescript
try {
  console.log(`📤 Creating ${filteredPOs.length} job plans...`);

  // Loop through each PO
  for (const po of filteredPOs) {
    const jobPlanningData = {
      nrcJobNo: po.jobNrcJobNo || po.job?.nrcJobNo,
      jobDemand: jobDemand,
      purchaseOrderId: po.id,
      steps: selectedSteps.map((step, stepIndex) => {
        // ... exact same logic as single job planning
      })
    };

    console.log(`📤 Creating job plan for PO ${po.id}...`);
    await onSave(jobPlanningData); // Multiple calls, same structure
  }

  console.log(`✅ Successfully created ${filteredPOs.length} job plans`);
  onClose();
}
```

## Benefits

1. ✅ **Consistent Data Structure** - Both single and bulk use identical format
2. ✅ **Backend Compatibility** - No backend changes needed
3. ✅ **Better Error Handling** - If one PO fails, you know which one
4. ✅ **Clearer Logging** - See each job plan creation in console
5. ✅ **Multiple Machines Support** - Preserved from previous fix
6. ✅ **Easier to Debug** - Same code path for both flows

## Testing

### Test Single Job Planning:

1. Select 1 PO
2. Add steps with multiple machines
3. Submit → Should create 1 job plan ✅

### Test Bulk Job Planning:

1. Select 3 POs
2. Add same steps with multiple machines
3. Submit → Should create 3 job plans (one for each PO) ✅
4. Each job plan should have the SAME steps and machine assignments

### Verify in Console:

```
📤 Creating 3 job plans...
📤 Creating job plan for PO 123 (NRC-001): {...}
📤 Creating job plan for PO 124 (NRC-002): {...}
📤 Creating job plan for PO 125 (NRC-003): {...}
✅ Successfully created 3 job plans
```

### Verify in Database:

- Check that 3 separate `JobPlanning` records are created
- Each has correct `nrcJobNo` and `purchaseOrderId`
- Each has the same steps with same `machineDetails` arrays
- All machine assignments are preserved

## Console Logs

The fix includes helpful debug logging:

```javascript
📤 Creating 3 job plans...

📤 Creating job plan for PO 123 (NRC-001):
{
  "nrcJobNo": "NRC-001",
  "jobDemand": "medium",
  "purchaseOrderId": 123,
  "steps": [
    {
      "stepNo": 1,
      "stepName": "Printing",
      "machineDetails": [
        { "id": "...", "machineCode": "MK-PR01", ... },
        { "id": "...", "machineCode": "MK-PR02", ... }
      ],
      "status": "planned"
    }
  ]
}

📤 Creating job plan for PO 124 (NRC-002):
{ ... }

📤 Creating job plan for PO 125 (NRC-003):
{ ... }

✅ Successfully created 3 job plans
```

## Summary

**The fix is simple:** Instead of trying to send all POs in one complex object, bulk job planning now loops through each PO and creates individual job plans using the **EXACT SAME** structure and API call as single job planning.

**Result:**

- ✅ Bulk job planning now works correctly
- ✅ No backend changes required
- ✅ Multiple machines per step still works
- ✅ Consistent behavior between single and bulk flows

**Files Changed:**

- `Nrc/src/Components/Roles/Planner/modal/BulkJobPlanning.tsx` (handleSubmit function)

**No other files were modified.**
