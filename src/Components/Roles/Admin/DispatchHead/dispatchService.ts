// Dispatch service for API calls
export interface DispatchProcess {
  id: number;
  jobNrcJobNo: string;
  status: 'accept' | 'pending' | 'rejected';
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
}

export interface DispatchData {
  totalDispatches: number;
  totalQuantityDispatched: number;
  totalBalanceQuantity: number;
  completedDispatches: number;
  pendingDispatches: number;
  rejectedDispatches: number;
}

class DispatchService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api`

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
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dispatch data: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data to handle missing/null values
      return result.data.map((dispatch: any) => ({
        id: dispatch.id || 0,
        jobNrcJobNo: dispatch.jobNrcJobNo || '-',
        status: dispatch.status || 'pending',
        date: dispatch.date || new Date().toISOString(),
        shift: dispatch.shift || null,
        operatorName: dispatch.operatorName || '-',
        quantity: dispatch.quantity || 0,
        dispatchNo: dispatch.dispatchNo || '-',
        dispatchDate: dispatch.dispatchDate || dispatch.date || new Date().toISOString(),
        remarks: dispatch.remarks || '-',
        balanceQty: dispatch.balanceQty || 0,
        qcCheckSignBy: dispatch.qcCheckSignBy || null,
        jobStepId: dispatch.jobStepId || null,
      }));
    } catch (error) {
      console.error('Error fetching dispatch processes:', error);
      // Return empty array instead of mock data
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
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dispatch data for job ${jobNo}: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data to handle missing/null values
      return result.data.map((dispatch: any) => ({
        id: dispatch.id || 0,
        jobNrcJobNo: dispatch.jobNrcJobNo || '-',
        status: dispatch.status || 'pending',
        date: dispatch.date || new Date().toISOString(),
        shift: dispatch.shift || null,
        operatorName: dispatch.operatorName || '-',
        quantity: dispatch.quantity || 0,
        dispatchNo: dispatch.dispatchNo || '-',
        dispatchDate: dispatch.dispatchDate || dispatch.date || new Date().toISOString(),
        remarks: dispatch.remarks || '-',
        balanceQty: dispatch.balanceQty || 0,
        qcCheckSignBy: dispatch.qcCheckSignBy || null,
        jobStepId: dispatch.jobStepId || null,
      }));
    } catch (error) {
      console.error(`Error fetching dispatch process for job ${jobNo}:`, error);
      throw error;
    }
  }

  // Get dispatch statistics
  async getDispatchStatistics(): Promise<DispatchData> {
    try {
      const dispatches = await this.getAllDispatchProcesses();
      
      return {
        totalDispatches: dispatches.length,
        totalQuantityDispatched: dispatches.reduce((sum, item) => sum + item.quantity, 0),
        totalBalanceQuantity: dispatches.reduce((sum, item) => sum + item.balanceQty, 0),
        completedDispatches: dispatches.filter(item => item.status === 'accept').length,
        pendingDispatches: dispatches.filter(item => item.status === 'pending').length,
        rejectedDispatches: dispatches.filter(item => item.status === 'rejected').length,
      };
    } catch (error) {
      console.error('Error calculating dispatch statistics:', error);
      // Return zero values instead of mock data
      return {
        totalDispatches: 0,
        totalQuantityDispatched: 0,
        totalBalanceQuantity: 0,
        completedDispatches: 0,
        pendingDispatches: 0,
        rejectedDispatches: 0,
      };
    }
  }
}

export const dispatchService = new DispatchService();
export default dispatchService; 