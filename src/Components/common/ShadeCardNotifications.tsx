import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchShadeCardNotifications,
  getNotificationPriority,
  type ShadeCardNotification,
} from "../../services/shadeCardNotificationService";

interface ShadeCardNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShadeCardNotifications: React.FC<ShadeCardNotificationsProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<ShadeCardNotification[]>(
    []
  );
  const [displayedNotifications, setDisplayedNotifications] = useState<
    ShadeCardNotification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<"all" | "overdue" | "urgent">("all");

  const ITEMS_PER_PAGE = 100;

  const getFilteredNotifications = () => {
    return notifications.filter((notif) => {
      if (filter === "overdue") return notif.daysRemaining < 0;
      if (filter === "urgent")
        return notif.daysRemaining >= 0 && notif.daysRemaining <= 7;
      return true;
    });
  };

  useEffect(() => {
    if (isOpen) {
      resetAndLoadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset pagination when filter changes
    if (notifications.length > 0) {
      setCurrentPage(0);
      setDisplayedNotifications([]);
      setHasMore(true);
      // Load first batch immediately
      const filtered = getFilteredNotifications();
      const firstBatch = filtered.slice(0, ITEMS_PER_PAGE);
      setDisplayedNotifications(firstBatch);
      setCurrentPage(1);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
    }
  }, [filter, notifications]);

  const resetAndLoadNotifications = async () => {
    setLoading(true);
    setCurrentPage(0);
    setDisplayedNotifications([]);
    setHasMore(true);

    try {
      const data = await fetchShadeCardNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNotifications = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const filteredNotifications = getFilteredNotifications();
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const nextBatch = filteredNotifications.slice(startIndex, endIndex);

    if (nextBatch.length === 0) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    setDisplayedNotifications((prev) => [...prev, ...nextBatch]);
    setCurrentPage((prev) => prev + 1);

    // Check if there are more items
    if (endIndex >= filteredNotifications.length) {
      setHasMore(false);
    }

    setLoadingMore(false);
  };

  const filteredNotifications = getFilteredNotifications();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityBadge = (jobDemand: "high" | "medium" | "low" | null) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-blue-100 text-blue-800",
      low: "bg-green-100 text-green-800",
    };
    const labels = {
      high: "Urgent",
      medium: "Regular",
      low: "Low Priority",
    };

    if (!jobDemand) return null;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[jobDemand]}`}
      >
        {labels[jobDemand]}
      </span>
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

    if (isNearBottom && hasMore && !loadingMore) {
      loadMoreNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-[#00AEEF] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-white" />
              <h3 className="text-lg font-medium text-white">
                Shade Card Approval Notifications (180-day Validity)
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-[#00AEEF] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("overdue")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "overdue"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Overdue (
                {notifications.filter((n) => n.daysRemaining < 0).length})
              </button>
              <button
                onClick={() => setFilter("urgent")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "urgent"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Urgent (≤7 days) (
                {
                  notifications.filter(
                    (n) => n.daysRemaining >= 0 && n.daysRemaining <= 7
                  ).length
                }
                )
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="px-6 py-4 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 200px)" }}
            onScroll={handleScroll}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading notifications...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BellIcon className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No notifications</p>
                <p className="text-gray-400 text-sm mt-2">
                  {filter === "all"
                    ? "All shade card approvals are within their 180-day validity period!"
                    : `No ${filter} shade card approvals`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedNotifications.map((notification) => {
                  const priority = getNotificationPriority(
                    notification.daysRemaining
                  );

                  return (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${
                        priority.bgColor
                      } border-l-4 ${
                        notification.daysRemaining < 0
                          ? "border-l-red-600"
                          : notification.daysRemaining <= 7
                          ? "border-l-orange-600"
                          : "border-l-yellow-600"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <ExclamationTriangleIcon
                            className={`h-6 w-6 ${priority.color} flex-shrink-0 mt-0.5`}
                          />
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {notification.nrcJobNo}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {notification.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${priority.color} ${priority.bgColor}`}
                          >
                            {priority.label}
                          </span>
                          {getPriorityBadge(notification.jobDemand)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            Approval Date:{" "}
                            <strong>
                              {formatDate(notification.shadeCardApprovalDate)}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${priority.color}`}>
                            {notification.daysRemaining < 0
                              ? `${Math.abs(
                                  notification.daysRemaining
                                )} days overdue`
                              : notification.daysRemaining === 0
                              ? "Expires today!"
                              : `${notification.daysRemaining} days remaining`}
                          </span>
                        </div>
                        {notification.poNumber && (
                          <div className="text-gray-600">
                            PO Number: <strong>{notification.poNumber}</strong>
                          </div>
                        )}
                        {notification.unit && (
                          <div className="text-gray-600">
                            Unit: <strong>{notification.unit}</strong>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className={`text-sm font-medium ${priority.color}`}>
                          {notification.daysRemaining < 0
                            ? "⚠️ This shade card approval has expired (past 180 days). Please update immediately!"
                            : notification.daysRemaining === 0
                            ? "⚠️ This shade card approval expires today (180-day validity period). Please update now!"
                            : `⚠️ This shade card approval will expire in ${notification.daysRemaining} days (180-day validity period). Please update soon.`}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00AEEF]"></div>
                      <span className="text-gray-500">
                        Loading more notifications...
                      </span>
                    </div>
                  </div>
                )}

                {/* End of List Indicator */}
                {!hasMore && displayedNotifications.length > 0 && (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-gray-400 text-sm">
                      You've reached the end of the list (
                      {displayedNotifications.length} of{" "}
                      {filteredNotifications.length} notifications)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
            <button
              onClick={resetAndLoadNotifications}
              className="text-[#00AEEF] hover:text-[#0088cc] font-medium text-sm"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadeCardNotifications;
