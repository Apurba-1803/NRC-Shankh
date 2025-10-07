const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export interface PlannerJob {
  nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  status: string;
  poStatus: string;
  machineDetailsStatus: string;
  artworkStatus: string;
  overallProgress: number;
  createdAt: string | null;
  updatedAt: string;
  poCount: number;
  artworkCount: number;
  hasMachineDetails: boolean;
}

export interface PlannerSummary {
  totalJobs: number;
  poCompleted: number;
  machineDetailsCompleted: number;
  artworkCompleted: number;
  fullyCompleted: number;
  partiallyCompleted: number;
  notStarted: number;
  totalActiveJobs: number;
totalCompletedJobs: number;

}

export interface PlannerDashboardData {
  summary: PlannerSummary;
  allJobs: PlannerJob[];
   activeJobs: PlannerJob[];      // Add this
  completedJobs: PlannerJob[];   // Add this
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class PlannerService {
  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }
      return result.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }

  // Get planner dashboard data
  async getPlannerDashboard(): Promise<PlannerDashboardData> {
    return this.fetchFromApi<PlannerDashboardData>('/planner-dashboard');
  }

  // Get jobs by status
  async getJobsByStatus(status: string): Promise<PlannerJob[]> {
    
    const data = await this.getPlannerDashboard();
    return data.allJobs.filter(job => job.status.toLowerCase() === status.toLowerCase());
  }

  // Get jobs by customer
  async getJobsByCustomer(customerName: string): Promise<PlannerJob[]> {
    const data = await this.getPlannerDashboard();
    return data.allJobs.filter(job => 
      job.customerName.toLowerCase().includes(customerName.toLowerCase())
    );
  }

  // Get jobs by progress range
  async getJobsByProgress(minProgress: number, maxProgress: number): Promise<PlannerJob[]> {
    const data = await this.getPlannerDashboard();
    return data.allJobs.filter(job => 
      job.overallProgress >= minProgress && job.overallProgress <= maxProgress
    );
  }

  // Get summary statistics
  async getSummary(): Promise<PlannerSummary> {
    const data = await this.getPlannerDashboard();
    return data.summary;
  }
}

export const plannerService = new PlannerService();
export default plannerService; 