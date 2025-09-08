// QC Manager service for API calls
export interface QCData {
  id: number;
  jobNrcJobNo: string;
  status: 'accept' | 'pending' | 'rejected';
  date: string;
  shift: string | null;
  operatorName: string | null;
  checkedBy: string;
  quantity: number;
  rejectedQty: number;
  reasonForRejection: string;
  remarks: string;
  qcCheckSignBy: string | null;
  jobStepId: number | null;
}

export interface QCSummary {
  totalQCChecks: number;
  totalQuantityChecked: number;
  totalAcceptedQuantity: number;
  totalRejectedQuantity: number;
  rejectionPercentage: number;
  topRejectionReason: string;
  topRejectionCount: number;
}

class QCService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api`;

  // Get all QC data
  async getAllQCData(): Promise<QCData[]> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/quality-dept`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QC data: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data to handle missing/null values
      return result.data.map((qc: any) => ({
        id: qc.id || 0,
        jobNrcJobNo: qc.jobNrcJobNo || '-',
        status: qc.status || 'pending',
        date: qc.date || new Date().toISOString(),
        shift: qc.shift || null,
        operatorName: qc.operatorName || '-',
        checkedBy: qc.checkedBy || '-',
        quantity: qc.quantity || 0,
        rejectedQty: qc.rejectedQty || 0,
        reasonForRejection: qc.reasonForRejection || '-',
        remarks: qc.remarks || '-',
        qcCheckSignBy: qc.qcCheckSignBy || null,
        jobStepId: qc.jobStepId || null,
      }));
    } catch (error) {
      console.error('Error fetching QC data:', error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get QC data by job number
  async getQCDataByJob(jobNo: string): Promise<QCData[]> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/quality-dept/by-job/${encodeURIComponent(jobNo)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QC data for job ${jobNo}: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data to handle missing/null values
      return result.data.map((qc: any) => ({
        id: qc.id || 0,
        jobNrcJobNo: qc.jobNrcJobNo || '-',
        status: qc.status || 'pending',
        date: qc.date || new Date().toISOString(),
        shift: qc.shift || null,
        operatorName: qc.operatorName || '-',
        checkedBy: qc.checkedBy || '-',
        quantity: qc.quantity || 0,
        rejectedQty: qc.rejectedQty || 0,
        reasonForRejection: qc.reasonForRejection || '-',
        remarks: qc.remarks || '-',
        qcCheckSignBy: qc.qcCheckSignBy || null,
        jobStepId: qc.jobStepId || null,
      }));
    } catch (error) {
      console.error(`Error fetching QC data for job ${jobNo}:`, error);
      throw error;
    }
  }

  // Get QC statistics
  async getQCStatistics(): Promise<QCSummary> {
    try {
      const qcData = await this.getAllQCData();
      
      if (qcData.length === 0) {
        return {
          totalQCChecks: 0,
          totalQuantityChecked: 0,
          totalAcceptedQuantity: 0,
          totalRejectedQuantity: 0,
          rejectionPercentage: 0,
          topRejectionReason: 'No data',
          topRejectionCount: 0,
        };
      }

      const totalQuantityChecked = qcData.reduce((sum, item) => sum + item.quantity, 0);
      const totalRejectedQuantity = qcData.reduce((sum, item) => sum + item.rejectedQty, 0);
      const totalAcceptedQuantity = totalQuantityChecked - totalRejectedQuantity;
      const rejectionPercentage = totalQuantityChecked > 0 ? (totalRejectedQuantity / totalQuantityChecked) * 100 : 0;

      // Find top rejection reason
      const rejectionReasons = qcData
        .filter(item => item.rejectedQty > 0)
        .reduce((acc, item) => {
          const reason = item.reasonForRejection || 'Unknown';
          acc[reason] = (acc[reason] || 0) + item.rejectedQty;
          return acc;
        }, {} as Record<string, number>);

      const topRejectionReason = Object.keys(rejectionReasons).length > 0 
        ? Object.entries(rejectionReasons).sort(([,a], [,b]) => b - a)[0][0]
        : 'No rejections';
      
      const topRejectionCount = Object.keys(rejectionReasons).length > 0 
        ? Object.entries(rejectionReasons).sort(([,a], [,b]) => b - a)[0][1]
        : 0;

      return {
        totalQCChecks: qcData.length,
        totalQuantityChecked,
        totalAcceptedQuantity,
        totalRejectedQuantity,
        rejectionPercentage: Math.round(rejectionPercentage * 100) / 100,
        topRejectionReason,
        topRejectionCount,
      };
    } catch (error) {
      console.error('Error calculating QC statistics:', error);
      return {
        totalQCChecks: 0,
        totalQuantityChecked: 0,
        totalAcceptedQuantity: 0,
        totalRejectedQuantity: 0,
        rejectionPercentage: 0,
        topRejectionReason: 'Error',
        topRejectionCount: 0,
      };
    }
  }
}

export const qcService = new QCService();
export default qcService; 