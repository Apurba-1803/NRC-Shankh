// Printing Manager service for API calls
export interface PrintingDetails {
  id: number;
  jobNrcJobNo: string;
  status: 'accept' | 'pending' | 'rejected';
  date: string;
  shift: string | null;
  oprName: string;
  noOfColours: number | null;
  inksUsed: string | null;
  quantity: number;
  wastage: number;
  coatingType: string | null;
  separateSheets: boolean | null;
  extraSheets: number | null;
  machine: string;
  jobStepId: number;
}

export interface PrintingSummary {
  totalPrintJobs: number;
  totalQuantityPrinted: number;
  totalWastage: number;
  acceptedJobs: number;
  pendingJobs: number;
  rejectedJobs: number;
  averageWastagePercentage: number;
}

class PrintingService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api`;

  // Get all printing details
  async getAllPrintingDetails(): Promise<PrintingDetails[]> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/printing-details`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch printing data: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data to handle missing/null values
      return result.data.map((printing: any) => ({
        id: printing.id || 0,
        jobNrcJobNo: printing.jobNrcJobNo || '-',
        status: printing.status || 'pending',
        date: printing.date || new Date().toISOString(),
        shift: printing.shift || null,
        oprName: printing.oprName || '-',
        noOfColours: printing.noOfColours || null,
        inksUsed: printing.inksUsed || '-',
        quantity: printing.quantity || 0,
        wastage: printing.wastage || 0,
        coatingType: printing.coatingType || '-',
        separateSheets: printing.separateSheets || null,
        extraSheets: printing.extraSheets || null,
        machine: printing.machine || '-',
        jobStepId: printing.jobStepId || null,
      }));
    } catch (error) {
      console.error('Error fetching printing details:', error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get printing details by job number
  async getPrintingDetailsByJob(jobNo: string): Promise<PrintingDetails[]> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/printing-details/by-job/${encodeURIComponent(jobNo)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch printing data for job ${jobNo}: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid API response format');
      }

      // Process the data to handle missing/null values
      return result.data.map((printing: any) => ({
        id: printing.id || 0,
        jobNrcJobNo: printing.jobNrcJobNo || '-',
        status: printing.status || 'pending',
        date: printing.date || new Date().toISOString(),
        shift: printing.shift || null,
        oprName: printing.oprName || '-',
        noOfColours: printing.noOfColours || null,
        inksUsed: printing.inksUsed || '-',
        quantity: printing.quantity || 0,
        wastage: printing.wastage || 0,
        coatingType: printing.coatingType || '-',
        separateSheets: printing.separateSheets || null,
        extraSheets: printing.extraSheets || null,
        machine: printing.machine || '-',
        jobStepId: printing.jobStepId || null,
      }));
    } catch (error) {
      console.error(`Error fetching printing details for job ${jobNo}:`, error);
      throw error;
    }
  }

  // Get printing statistics
  async getPrintingStatistics(): Promise<PrintingSummary> {
    try {
      const printingData = await this.getAllPrintingDetails();
      
      if (printingData.length === 0) {
        return {
          totalPrintJobs: 0,
          totalQuantityPrinted: 0,
          totalWastage: 0,
          acceptedJobs: 0,
          pendingJobs: 0,
          rejectedJobs: 0,
          averageWastagePercentage: 0,
        };
      }

      const totalQuantityPrinted = printingData.reduce((sum, item) => sum + item.quantity, 0);
      const totalWastage = printingData.reduce((sum, item) => sum + item.wastage, 0);
      const averageWastagePercentage = totalQuantityPrinted > 0 ? (totalWastage / totalQuantityPrinted) * 100 : 0;

      return {
        totalPrintJobs: printingData.length,
        totalQuantityPrinted,
        totalWastage,
        acceptedJobs: printingData.filter(item => item.status === 'accept').length,
        pendingJobs: printingData.filter(item => item.status === 'pending').length,
        rejectedJobs: printingData.filter(item => item.status === 'rejected').length,
        averageWastagePercentage: Math.round(averageWastagePercentage * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating printing statistics:', error);
      return {
        totalPrintJobs: 0,
        totalQuantityPrinted: 0,
        totalWastage: 0,
        acceptedJobs: 0,
        pendingJobs: 0,
        rejectedJobs: 0,
        averageWastagePercentage: 0,
      };
    }
  }
}

export const printingService = new PrintingService();
export default printingService; 