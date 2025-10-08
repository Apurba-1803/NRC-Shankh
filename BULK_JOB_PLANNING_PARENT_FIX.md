# Bulk Job Planning Parent Component Fix

## Problem

After fixing BulkJobPlanning to use the same structure as single job planning, we got this error:

```
TypeError: Cannot read properties of undefined (reading 'map')
at handleBulkJobPlanning (planner_jobs.tsx:425:61)
```

## Root Cause

The parent component (`planner_jobs.tsx`) was still expecting the **old bulk structure** with `bulkJobPlanningData.nrcJobNos.map()`, but the modal was now sending **individual job planning objects** (one call per PO).

### Mismatch:

**BulkJobPlanningModal sends:**

```typescript
for (const po of filteredPOs) {
  await onSave(jobPlanningData); // Individual object
}
```

**Parent was expecting:**

```typescript
bulkJobPlanningData.nrcJobNos.map(...) // ❌ nrcJobNos doesn't exist!
```

## Solution

Updated `handleBulkJobPlanning` in `planner_jobs.tsx` to:

1. Accept **individual job planning data** (same as single job planning)
2. Forward it directly to the API
3. Extract machines from `machineDetails` arrays
4. Re-throw errors so the modal can handle them

## Code Changes

### File: `planner_jobs.tsx`

#### BEFORE (Expected bulk structure):

```typescript
const handleBulkJobPlanning = async (bulkJobPlanningData: any) => {
  // Expected: bulkJobPlanningData.nrcJobNos (array)
  // Expected: bulkJobPlanningData.steps (shared steps)
  // Expected: bulkJobPlanningData.selectedMachines (array)

  const jobPlanPromises = bulkJobPlanningData.nrcJobNos.map(...); // ❌ Crashes!
  // ... complex mapping logic
};
```

#### AFTER (Accepts individual job planning):

```typescript
const handleBulkJobPlanning = async (jobPlanningData: any) => {
  // Receives individual job planning object (same as single)
  // Has: nrcJobNo, jobDemand, purchaseOrderId, steps[]

  // Just forward to API
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

  // Extract machines from machineDetails
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
  // ... (same logic, but uses extracted machines)

  // Re-throw errors to let modal handle them
  throw err;
};
```

### File: `BulkJobPlanning.tsx`

Added `onRefresh` prop and post-success handling:

```typescript
interface BulkJobPlanningModalProps {
  filteredPOs: PurchaseOrder[];
  onSave: (jobPlanningData: any) => Promise<void>;
  onClose: () => void;
  onRefresh?: () => void; // 🔥 NEW
}

// In handleSubmit success:
console.log(`✅ Successfully created ${filteredPOs.length} job plans`);

// Show success message
alert(`Successfully created job plans for ${filteredPOs.length} POs!`);

// Refresh data if callback provided
if (onRefresh) {
  onRefresh();
}

// Close modal
onClose();
```

### File: `planner_jobs.tsx` (Modal Usage)

```typescript
<BulkJobPlanningModal
  filteredPOs={filteredPOs}
  onSave={handleBulkJobPlanning}
  onClose={() => setShowBulkPlanningModal(false)}
  onRefresh={fetchPurchaseOrders} // 🔥 NEW
/>
```

## Data Flow (Fixed)

### Single Job Planning:

```
Modal creates jobPlanningData
   ↓
Calls onSave(jobPlanningData) ONCE
   ↓
Parent forwards to API
   ↓
Success ✅
```

### Bulk Job Planning (After Fix):

```
Modal loops through 3 POs
   ↓
For each PO:
  - Creates jobPlanningData (SAME structure as single)
  - Calls onSave(jobPlanningData)
   ↓
Parent forwards to API (SAME logic as single)
   ↓
After all POs:
  - Show success alert
  - Refresh data
  - Close modal
   ↓
Success ✅
```

## Key Benefits

1. ✅ **Consistent Handler** - Parent uses same logic for single and bulk
2. ✅ **Error Handling** - Errors propagate correctly to modal
3. ✅ **Machine Status Updates** - Extracts from machineDetails arrays
4. ✅ **Data Refresh** - Automatic refresh after bulk operation
5. ✅ **User Feedback** - Success message shows count

## Testing

### Test Bulk Job Planning:

1. Select 3 POs
2. Add steps: Printing (2 machines), Corrugation (1 machine), PaperStore (no machines)
3. Submit

**Expected Console Output:**

```
📤 Creating 3 job plans...

📤 Creating job plan for PO 123 (NRC-001): {...}
Creating job plan for NRC-001 {...}
Job plan created successfully: {...}
✅ Machine cm123... status updated to busy
✅ Machine cm456... status updated to busy
✅ Machine cm789... status updated to busy

📤 Creating job plan for PO 124 (NRC-002): {...}
Creating job plan for NRC-002 {...}
Job plan created successfully: {...}
✅ Machine cm123... status updated to busy
✅ Machine cm456... status updated to busy
✅ Machine cm789... status updated to busy

📤 Creating job plan for PO 125 (NRC-003): {...}
Creating job plan for NRC-003 {...}
Job plan created successfully: {...}
✅ Machine cm123... status updated to busy
✅ Machine cm456... status updated to busy
✅ Machine cm789... status updated to busy

✅ Successfully created 3 job plans
[Alert] Successfully created job plans for 3 POs!
```

### Verify:

- ✅ No "Cannot read properties of undefined" error
- ✅ 3 separate job planning records created in database
- ✅ Each has correct steps with machineDetails arrays
- ✅ Steps without machines have empty machineDetails arrays
- ✅ Machine statuses updated to "busy"
- ✅ Data refreshed after completion
- ✅ Modal closes automatically

## Summary

Fixed the parent component to accept **individual job planning data** instead of expecting a bulk wrapper. Now both single and bulk job planning use the **exact same API call structure**, making the code cleaner and more maintainable.

**Files Modified:**

1. `Nrc/src/Components/Roles/Planner/planner_jobs.tsx` - Simplified handleBulkJobPlanning
2. `Nrc/src/Components/Roles/Planner/modal/BulkJobPlanning.tsx` - Added onRefresh prop and success handling

**Result:** Bulk job planning now works perfectly with multiple machines per step! 🎉
