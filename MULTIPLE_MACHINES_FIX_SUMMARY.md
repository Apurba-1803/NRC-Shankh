# Multiple Machines Per Step - Fix Summary

## Problem Statement

The job planning modals (BulkJobPlanning and SingleJobPlanningModal) were only allowing ONE machine per step, but the requirement was to support MULTIPLE machines per step (as already implemented in AddStepsModal).

## Root Cause Analysis

### Issue #1: TypeScript Interface Mismatch in AddStepsModal

**File:** `AddStepsModal.tsx`

- **Problem:** The `onSelect` callback interface was defined to accept only 2 parameters `(steps, machines)` but the implementation was passing 3 parameters `(steps, machines, stepMachineMapping)`
- **Impact:** The third parameter (stepMachineMapping) was being silently dropped by TypeScript

### Issue #2: BulkJobPlanning Not Receiving Machine Mappings

**File:** `BulkJobPlanning.tsx`

- **Problem:** The modal was only receiving 2 parameters from AddStepsModal and trying to auto-match machines to steps using `STEP_TO_MACHINE_MAPPING`
- **Impact:** Only ONE machine was being assigned per step (the first match), ignoring user's multi-machine selections

### Issue #3: SingleJobPlanningModal Similar Issue

**File:** `SingleJobPlanningModal.tsx`

- **Problem:** Had infrastructure for stepMachines mapping but wasn't fully utilizing it
- **Impact:** Machine assignments weren't being properly tracked per step

## Solution Implemented

### 1. Fixed AddStepsModal Interface (✅ COMPLETED)

**Changes in `AddStepsModal.tsx`:**

```typescript
// BEFORE
interface AddStepsModalProps {
  onSelect: (steps: JobStep[], machines: Machine[]) => void;
}

// AFTER
interface AddStepsModalProps {
  onSelect: (
    steps: JobStep[],
    machines: Machine[],
    stepMachineMapping: Record<string, string[]>
  ) => void;
  stepMachines?: Record<string, string[]>;
  allMachines?: Machine[];
}
```

### 2. Enhanced BulkJobPlanning (✅ COMPLETED)

**Changes in `BulkJobPlanning.tsx`:**

#### Added State Management:

```typescript
const [stepMachines, setStepMachines] = useState<Record<string, string[]>>({});
const [allMachines, setAllMachines] = useState<Machine[]>([]);
```

#### Added Machine Fetching:

```typescript
React.useEffect(() => {
  fetchMachines();
}, []);
```

#### Updated handleSubmit to Use stepMachines:

```typescript
// BEFORE: Auto-matching (only first machine)
const assignedMachine = selectedMachines.find(m => ...);

// AFTER: Using explicit step-machine mapping (all machines)
const assignedMachineIds = stepMachines[step.stepName] || [];
const assignedMachines = assignedMachineIds
  .map(machineId => allMachines.find(m => m.id === machineId))
  .filter(Boolean) as Machine[];

const machineDetails = assignedMachines.map(machine => ({
  id: machine.id,
  unit: po.unit || machine.unit || 'Unit 1',
  machineCode: machine.machineCode,
  machineType: machine.machineType
}));
```

#### Updated AddStepsModal Handler:

```typescript
onSelect={(steps, machines, stepMachineMapping) => {
  setSelectedSteps(steps);
  setSelectedMachines(machines);
  setStepMachines(stepMachineMapping); // 🔥 NEW: Store mapping
  setShowStepsModal(false);
}}
```

#### Added Enhanced UI Display:

- Shows each step with its assigned machines in a detailed card view
- Displays machine count per step
- Shows machine codes as green pills
- Indicates steps with no machines assigned

### 3. Enhanced SingleJobPlanningModal (✅ COMPLETED)

**Changes in `SingleJobPlanningModal.tsx`:**

#### Similar improvements as BulkJobPlanning:

- Added `stepMachines` and `allMachines` state
- Added machine fetching on mount
- Updated `handleSubmit` to use `stepMachines` mapping
- Updated `handleStepsSelect` to receive third parameter
- Added enhanced UI to display step-machine assignments

### 4. Backend Compatibility (✅ VERIFIED)

**Backend code in `jobPlanningController.ts`:**

```typescript
steps: {
  create: steps.map((step: any) => ({
    stepNo: step.stepNo,
    stepName: step.stepName,
    status: 'planned',
    machineDetails: step.machineDetails ? step.machineDetails.map((machine: any) => ({
      machineId: machine.machineId || machine.id,
      unit: machine.unit,
      machineCode: machine.machineCode,
      machineType: machine.machineType
    })) : [],
  })),
}
```

✅ Backend correctly handles arrays of machines in `machineDetails`

## Data Flow

### Before Fix:

```
AddStepsModal (select 3 machines for Printing)
  ↓ passes (steps, [machine1, machine2, machine3])
BulkJobPlanning receives only 2 params
  ↓ tries to auto-match
  ↓ finds first match: machine1
API receives: Printing → [machine1] ❌
```

### After Fix:

```
AddStepsModal (select 3 machines for Printing)
  ↓ passes (steps, [machine1, machine2, machine3], {Printing: [id1, id2, id3]})
BulkJobPlanning receives all 3 params
  ↓ uses stepMachines mapping
  ↓ finds: {Printing: [id1, id2, id3]}
  ↓ maps to full machine objects
API receives: Printing → [machine1, machine2, machine3] ✅
```

## Testing Checklist

### For BulkJobPlanning:

- [x] Select multiple steps in AddStepsModal
- [x] Assign multiple machines to each step (e.g., 2 Printing machines, 3 Punching machines)
- [x] Verify UI shows correct machine assignments
- [x] Submit and check console logs for `stepMachines` mapping
- [x] Verify API payload includes all machines in `machineDetails` array

### For SingleJobPlanningModal:

- [x] Select multiple steps in AddStepsModal
- [x] Assign multiple machines to each step
- [x] Verify UI shows correct machine assignments
- [x] Submit and check API payload

### Backend Verification:

- [x] Verify job planning is created with multiple machines per step
- [x] Check database that `machineDetails` JSON field contains array with all machines
- [x] Verify machines are properly retrieved when fetching job planning

## Key Files Modified

1. ✅ `Nrc/src/Components/Roles/Planner/modal/AddStepsModal.tsx`

   - Fixed TypeScript interface to include third parameter
   - Added optional props for external machine data

2. ✅ `Nrc/src/Components/Roles/Planner/modal/BulkJobPlanning.tsx`

   - Added stepMachines state and management
   - Added machine fetching
   - Updated submit logic to use explicit mappings
   - Enhanced UI to show machine assignments

3. ✅ `Nrc/src/Components/Roles/Planner/modal/SingleJobPlanningModal.tsx`
   - Cleaned up unused code
   - Enhanced submit logic to properly use stepMachines
   - Added detailed UI for machine assignments

## Benefits

1. **Multiple Machines Support:** Each step can now have multiple machines assigned
2. **Explicit Assignment:** No more auto-matching - uses exact user selections
3. **Better UI:** Clear visual feedback showing which machines are assigned to which steps
4. **Type Safety:** Fixed TypeScript interfaces for proper type checking
5. **Backend Compatible:** Payload format matches backend expectations perfectly

## Console Logs for Debugging

The following debug logs are now available:

### In AddStepsModal:

```
🔍 AddStepsModal - handleSave:
📋 Sorted steps: [...]
🏭 Machines array: [...]
🔧 Step-Machine mapping: {...}
```

### In BulkJobPlanning:

```
🔍 BulkJobPlanning - onSelect received:
📋 Steps: [...]
🏭 Machines: [...]
🔧 Step-Machine mapping: {...}
📤 Bulk job planning data with PO IDs: {...}
📋 Individual job plans: [...]
```

### In SingleJobPlanningModal:

```
🔍 handleStepsSelect called with:
📋 Steps: [...]
🏭 Machines: [...]
🔧 Step-Machine mapping: {...}
📤 Single job planning API payload: {...}
```

## Summary

The issue was a **broken data flow** where the step-to-machine mapping was being lost between AddStepsModal and the planning modals. This has been fixed by:

1. Correcting TypeScript interfaces
2. Properly passing and storing the `stepMachines` mapping
3. Using the explicit mapping instead of auto-matching
4. Enhancing the UI to show machine assignments clearly

All changes are **backward compatible** with the existing backend API and maintain the same data structure expected by the database.
