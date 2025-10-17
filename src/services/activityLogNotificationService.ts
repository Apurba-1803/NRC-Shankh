// Service to handle job creation notifications stored in localStorage

export interface ActivityLogNotification {
  id: string;
  style: string;
  customer: string;
  createdAt: string;
  status: "pending" | "resolved";
  // Additional PO details
  poNumber?: string;
  poDate?: string;
  deliveryDate?: string;
  totalPOQuantity?: number;
  unit?: string;
  plant?: string;
  boardSize?: string;
  noOfColor?: string;
  fluteType?: string;
}

/**
 * Fetch job creation notifications from localStorage
 */
export const fetchActivityLogNotifications = async (): Promise<
  ActivityLogNotification[]
> => {
  try {
    const notifications = JSON.parse(
      localStorage.getItem("jobCreationNotifications") || "[]"
    );

    // Filter only pending notifications
    const pendingNotifications = notifications.filter(
      (notif: ActivityLogNotification) => notif.status === "pending"
    );

    // Sort by creation date (most recent first)
    pendingNotifications.sort(
      (a: ActivityLogNotification, b: ActivityLogNotification) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return pendingNotifications;
  } catch (error) {
    console.error("Error fetching job creation notifications:", error);
    return [];
  }
};

/**
 * Dismiss a job creation notification by marking it as resolved
 */
export const dismissActivityLogNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const notifications = JSON.parse(
      localStorage.getItem("jobCreationNotifications") || "[]"
    );

    const updatedNotifications = notifications.map(
      (notif: ActivityLogNotification) =>
        notif.id === notificationId ? { ...notif, status: "resolved" } : notif
    );

    localStorage.setItem(
      "jobCreationNotifications",
      JSON.stringify(updatedNotifications)
    );

    return true;
  } catch (error) {
    console.error("Error dismissing notification:", error);
    return false;
  }
};

/**
 * Get count of activity log notifications
 */
export const getActivityLogCount = (
  notifications: ActivityLogNotification[]
): number => {
  return notifications.length;
};
