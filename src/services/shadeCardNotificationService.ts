// Service to handle shade card approval date notifications

export interface ShadeCardNotification {
  id: string;
  nrcJobNo: string;
  customerName: string;
  shadeCardApprovalDate: string;
  daysRemaining: number;
  jobDemand: "high" | "medium" | "low" | null;
  poNumber?: string;
  unit?: string;
}

/**
 * Calculate days remaining until shade card approval expires (180 days validity period)
 */
export const calculateDaysRemaining = (shadeCardDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const approvalDate = new Date(shadeCardDate);
  approvalDate.setHours(0, 0, 0, 0);

  // Calculate expiry date (180 days from approval date)
  const expiryDate = new Date(approvalDate);
  expiryDate.setDate(approvalDate.getDate() + 180);

  // Calculate days remaining until expiry
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Check if shade card approval needs attention (30 days or less before 180-day expiry)
 */
export const needsShadeCardUpdate = (shadeCardDate: string | null): boolean => {
  if (!shadeCardDate) return false;

  const daysRemaining = calculateDaysRemaining(shadeCardDate);
  return daysRemaining <= 30 && daysRemaining >= 0;
};

/**
 * Check if shade card approval is overdue (past 180-day expiry)
 */
export const isShadeCardOverdue = (shadeCardDate: string | null): boolean => {
  if (!shadeCardDate) return false;

  const daysRemaining = calculateDaysRemaining(shadeCardDate);
  return daysRemaining < 0;
};

/**
 * Fetch all jobs with shade card approval dates that need attention (30 days before 180-day expiry)
 */
export const fetchShadeCardNotifications = async (): Promise<
  ShadeCardNotification[]
> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    // Fetch all jobs
    const response = await fetch("https://nrprod.nrcontainers.com/api/jobs/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return [];
    }

    const notifications: ShadeCardNotification[] = [];

    // Process jobs and filter those with shade card dates needing attention
    data.data.forEach((job: any) => {
      if (job.shadeCardApprovalDate) {
        const daysRemaining = calculateDaysRemaining(job.shadeCardApprovalDate);

        // Include if 30 days or less before expiry (including overdue)
        if (daysRemaining <= 30) {
          notifications.push({
            id: `${job.nrcJobNo}-${job.id}`,
            nrcJobNo: job.nrcJobNo,
            customerName: job.customerName || "Unknown Customer",
            shadeCardApprovalDate: job.shadeCardApprovalDate,
            daysRemaining,
            jobDemand: job.jobDemand,
            poNumber: job.poNumber,
            unit: job.unit,
          });
        }
      }
    });

    // Sort by days remaining (most urgent first)
    notifications.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return notifications;
  } catch (error) {
    console.error("Error fetching shade card notifications:", error);
    return [];
  }
};

/**
 * Get notification badge count
 */
export const getNotificationCount = (
  notifications: ShadeCardNotification[]
): number => {
  return notifications.length;
};

/**
 * Get priority color based on days remaining
 */
export const getNotificationPriority = (
  daysRemaining: number
): {
  color: string;
  bgColor: string;
  label: string;
} => {
  if (daysRemaining < 0) {
    return {
      color: "text-red-800",
      bgColor: "bg-red-100",
      label: "OVERDUE",
    };
  } else if (daysRemaining <= 7) {
    return {
      color: "text-red-700",
      bgColor: "bg-red-50",
      label: "URGENT",
    };
  } else if (daysRemaining <= 15) {
    return {
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      label: "WARNING",
    };
  } else {
    return {
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      label: "NOTICE",
    };
  }
};
