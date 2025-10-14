import React, { useState, useEffect } from "react";
import {
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchShadeCardNotifications,
  getNotificationPriority,
  type ShadeCardNotification,
} from "../../services/shadeCardNotificationService";
import ShadeCardNotifications from "./ShadeCardNotifications";

interface ShadeCardNotificationWidgetProps {
  className?: string;
}

const ShadeCardNotificationWidget: React.FC<
  ShadeCardNotificationWidgetProps
> = ({ className = "" }) => {
  const [notifications, setNotifications] = useState<ShadeCardNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchShadeCardNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const overdueCount = notifications.filter((n) => n.daysRemaining < 0).length;
  const urgentCount = notifications.filter(
    (n) => n.daysRemaining >= 0 && n.daysRemaining <= 7
  ).length;
  const warningCount = notifications.filter(
    (n) => n.daysRemaining > 7 && n.daysRemaining <= 30
  ).length;

  const topNotifications = notifications.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div
        className={`bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 ${className}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <BellIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Shade Card Approvals
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-green-600 text-5xl mb-2">✓</div>
          <p className="text-green-700 font-medium">All Up to Date!</p>
          <p className="text-green-600 text-sm mt-1">
            No shade card approvals need attention
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-6 w-6 text-[#00AEEF]" />
            <h3 className="text-lg font-semibold text-gray-900">
              Shade Card Approval Alerts
            </h3>
          </div>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
            {notifications.length} Total
          </span>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {overdueCount > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
              <div className="text-red-600 text-2xl font-bold">
                {overdueCount}
              </div>
              <div className="text-red-700 text-xs font-medium">Overdue</div>
            </div>
          )}
          {urgentCount > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-600 p-3 rounded">
              <div className="text-orange-600 text-2xl font-bold">
                {urgentCount}
              </div>
              <div className="text-orange-700 text-xs font-medium">≤7 Days</div>
            </div>
          )}
          {warningCount > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-3 rounded">
              <div className="text-yellow-600 text-2xl font-bold">
                {warningCount}
              </div>
              <div className="text-yellow-700 text-xs font-medium">
                8-30 Days
              </div>
            </div>
          )}
        </div>

        {/* Top 3 Notifications */}
        <div className="space-y-3 mb-4">
          {topNotifications.map((notification) => {
            const priority = getNotificationPriority(
              notification.daysRemaining
            );

            return (
              <div
                key={notification.id}
                className={`${priority.bgColor} border-l-4 ${
                  notification.daysRemaining < 0
                    ? "border-l-red-600"
                    : notification.daysRemaining <= 7
                    ? "border-l-orange-600"
                    : "border-l-yellow-600"
                } p-3 rounded`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <ExclamationTriangleIcon
                      className={`h-5 w-5 ${priority.color} flex-shrink-0 mt-0.5`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {notification.nrcJobNo}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {notification.customerName}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {formatDate(notification.shadeCardApprovalDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-right flex-shrink-0 ml-2`}>
                    <span
                      className={`text-xs font-bold ${priority.color} whitespace-nowrap`}
                    >
                      {notification.daysRemaining < 0
                        ? `${Math.abs(notification.daysRemaining)}d overdue`
                        : notification.daysRemaining === 0
                        ? "Today!"
                        : `${notification.daysRemaining}d`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <button
          onClick={() => setShowAllNotifications(true)}
          className="w-full bg-[#00AEEF] hover:bg-[#0088cc] text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View All Notifications ({notifications.length})
        </button>
      </div>

      <ShadeCardNotifications
        isOpen={showAllNotifications}
        onClose={() => {
          setShowAllNotifications(false);
          loadNotifications();
        }}
      />
    </>
  );
};

export default ShadeCardNotificationWidget;
