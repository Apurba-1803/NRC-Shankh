export interface DispatchProcess {
  id: number;
  jobNrcJobNo: string;
  status: 'accept' | 'pending' | 'rejected' | 'planned' | 'start' | 'stop';
  date: string;
  shift: string | null;
  operatorName: string;
  quantity: number;
  dispatchNo: string;
  dispatchDate: string;
  remarks: string;
  balanceQty: number;
  qcCheckSignBy: string | null;
  jobStepId: number | null;
  // Add new fields from the API structure
  stepNo?: number;
  stepName?: string;
  startDate?: string | null;
  endDate?: string | null;
  user?: string | null;
  machineDetails?: Array<{
    unit: string;
    machineId: string | null;
    machineCode: string | null;
    machineType: string;
  }>;
  jobPlanId?: number;
  dispatchDetails?: any; // For when dispatch details are available
}

export interface DispatchData {
  totalDispatches: number;
  totalQuantityDispatched: number;
  totalBalanceQuantity: number;
  completedDispatches: number;
  pendingDispatches: number;
  rejectedDispatches: number;
  plannedDispatches: number;
  inProgressDispatches: number;
}

class DispatchService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api`;

  // Get all dispatch processes
  async getAllDispatchProcesses(): Promise<DispatchProcess[]> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/dispatch-process`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dispatch data: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data based on the actual API structure
      return result.data.map((item: any) => {
        // Extract dispatch details if available (similar to printing/qc details)
        const dispatchDetails = item.dispatchDetails || null;
        
        // If dispatchDetails is null (for planned jobs), create a minimal object
        if (!dispatchDetails) {
          return {
            id: item.id || 0,
            jobNrcJobNo: item.nrcJobNo || '-',
            status: item.status || 'planned',
            date: item.startDate || item.createdAt || new Date().toISOString(),
            shift: null,
            operatorName: item.user || '-',
            quantity: 0,
            dispatchNo: '-',
            dispatchDate: item.startDate || item.createdAt || new Date().toISOString(),
            remarks: '-',
            balanceQty: 0,
            qcCheckSignBy: null,
            jobStepId: item.id || null,
            // Add step-level information
            stepNo: item.stepNo,
            stepName: item.stepName,
            startDate: item.startDate,
            endDate: item.endDate,
            user: item.user,
            machineDetails: item.machineDetails || [],
            jobPlanId: item.jobPlanId,
            dispatchDetails: null
          };
        }

        // Map the actual dispatch details when available
        return {
          id: dispatchDetails.id || item.id || 0,
          jobNrcJobNo: dispatchDetails.jobNrcJobNo || item.nrcJobNo || '-',
          status: dispatchDetails.status || item.status || 'pending',
          date: dispatchDetails.date || item.startDate || item.createdAt || new Date().toISOString(),
          shift: dispatchDetails.shift || null,
          operatorName: dispatchDetails.operatorName || dispatchDetails.driverName || item.user || '-',
          quantity: dispatchDetails.quantity || dispatchDetails.dispatchQuantity || 0,
          dispatchNo: dispatchDetails.dispatchNo || '-',
          dispatchDate: dispatchDetails.dispatchDate || dispatchDetails.date || item.startDate || new Date().toISOString(),
          remarks: dispatchDetails.remarks || '-',
          balanceQty: dispatchDetails.balanceQty || dispatchDetails.balanceQuantity || 0,
          qcCheckSignBy: dispatchDetails.qcCheckSignBy || null,
          jobStepId: dispatchDetails.jobStepId || item.id || null,
          // Add step-level information
          stepNo: item.stepNo,
          stepName: item.stepName,
          startDate: item.startDate,
          endDate: item.endDate,
          user: item.user,
          machineDetails: item.machineDetails || [],
          jobPlanId: item.jobPlanId,
          dispatchDetails
        };
      });
    } catch (error) {
      console.error('Error fetching dispatch processes:', error);
      return [];
    }
  }

  // Get dispatch process by job number
  async getDispatchProcessByJob(jobNo: string): Promise<DispatchProcess[]> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/dispatch-process/by-job/${encodeURIComponent(jobNo)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dispatch data for job ${jobNo}: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Use the same mapping logic as getAllDispatchProcesses
      return result.data.map((item: any) => {
        const dispatchDetails = item.dispatchDetails || null;
        
        if (!dispatchDetails) {
          return {
            id: item.id || 0,
            jobNrcJobNo: item.nrcJobNo || jobNo,
            status: item.status || 'planned',
            date: item.startDate || item.createdAt || new Date().toISOString(),
            shift: null,
            operatorName: item.user || '-',
            quantity: 0,
            dispatchNo: '-',
            dispatchDate: item.startDate || item.createdAt || new Date().toISOString(),
            remarks: '-',
            balanceQty: 0,
            qcCheckSignBy: null,
            jobStepId: item.id || null,
            stepNo: item.stepNo,
            stepName: item.stepName,
            startDate: item.startDate,
            endDate: item.endDate,
            user: item.user,
            machineDetails: item.machineDetails || [],
            jobPlanId: item.jobPlanId,
            dispatchDetails: null
          };
        }

        return {
          id: dispatchDetails.id || item.id || 0,
          jobNrcJobNo: dispatchDetails.jobNrcJobNo || jobNo,
          status: dispatchDetails.status || item.status || 'pending',
          date: dispatchDetails.date || item.startDate || item.createdAt || new Date().toISOString(),
          shift: dispatchDetails.shift || null,
          operatorName: dispatchDetails.operatorName || dispatchDetails.driverName || item.user || '-',
          quantity: dispatchDetails.quantity || dispatchDetails.dispatchQuantity || 0,
          dispatchNo: dispatchDetails.dispatchNo || '-',
          dispatchDate: dispatchDetails.dispatchDate || dispatchDetails.date || item.startDate || new Date().toISOString(),
          remarks: dispatchDetails.remarks || '-',
          balanceQty: dispatchDetails.balanceQty || dispatchDetails.balanceQuantity || 0,
          qcCheckSignBy: dispatchDetails.qcCheckSignBy || null,
          jobStepId: dispatchDetails.jobStepId || item.id || null,
          stepNo: item.stepNo,
          stepName: item.stepName,
          startDate: item.startDate,
          endDate: item.endDate,
          user: item.user,
          machineDetails: item.machineDetails || [],
          jobPlanId: item.jobPlanId,
          dispatchDetails
        };
      });
    } catch (error) {
      console.error(`Error fetching dispatch process for job ${jobNo}:`, error);
      throw error;
    }
  }

  // Get dispatch statistics
  async getDispatchStatistics(): Promise<DispatchData> {
    try {
      const dispatches = await this.getAllDispatchProcesses();
      
      if (dispatches.length === 0) {
        return {
          totalDispatches: 0,
          totalQuantityDispatched: 0,
          totalBalanceQuantity: 0,
          completedDispatches: 0,
          pendingDispatches: 0,
          rejectedDispatches: 0,
          plannedDispatches: 0,
          inProgressDispatches: 0,
        };
      }

      const totalQuantityDispatched = dispatches.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalBalanceQuantity = dispatches.reduce((sum, item) => sum + (item.balanceQty || 0), 0);

      // Count by status
      const completedDispatches = dispatches.filter(item => item.status === 'accept' || item.status === 'stop').length;
      const pendingDispatches = dispatches.filter(item => item.status === 'pending').length;
      const rejectedDispatches = dispatches.filter(item => item.status === 'rejected').length;
      const plannedDispatches = dispatches.filter(item => item.status === 'planned').length;
      const inProgressDispatches = dispatches.filter(item => item.status === 'start').length;

      return {
        totalDispatches: dispatches.length,
        totalQuantityDispatched,
        totalBalanceQuantity,
        completedDispatches,
        pendingDispatches,
        rejectedDispatches,
        plannedDispatches,
        inProgressDispatches,
      };
    } catch (error) {
      console.error('Error calculating dispatch statistics:', error);
      return {
        totalDispatches: 0,
        totalQuantityDispatched: 0,
        totalBalanceQuantity: 0,
        completedDispatches: 0,
        pendingDispatches: 0,
        rejectedDispatches: 0,
        plannedDispatches: 0,
        inProgressDispatches: 0,
      };
    }
  }
}

export const dispatchService = new DispatchService();
export default dispatchService;
