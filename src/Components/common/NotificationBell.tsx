import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import {
  fetchShadeCardNotifications,
  getNotificationCount,
} from "../../services/shadeCardNotificationService";
import ShadeCardNotifications from "./ShadeCardNotifications";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
}) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initial load
    loadNotificationCount();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadNotificationCount();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const notifications = await fetchShadeCardNotifications();
      setNotificationCount(getNotificationCount(notifications));
    } catch (error) {
      console.error("Error loading notification count:", error);
    }
  };

  const handleClick = () => {
    setShowNotifications(true);
    // Refresh count when opening
    loadNotificationCount();
  };

  const handleClose = () => {
    setShowNotifications(false);
    // Refresh count after closing
    loadNotificationCount();
  };

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative p-2 rounded-full hover:bg-gray-200 transition-colors ${className}`}
        aria-label="Shade Card Notifications"
        title="Shade Card Approval Notifications"
      >
        {isHovered || notificationCount > 0 ? (
          <BellIconSolid
            className={`h-6 w-6 ${
              notificationCount > 0 ? "text-[#00AEEF]" : "text-gray-600"
            }`}
          />
        ) : (
          <BellIcon className="h-6 w-6 text-gray-600" />
        )}

        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </button>

      <ShadeCardNotifications
        isOpen={showNotifications}
        onClose={handleClose}
      />
    </>
  );
};

export default NotificationBell;
