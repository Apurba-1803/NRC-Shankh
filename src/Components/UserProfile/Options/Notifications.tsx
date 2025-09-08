import React, { useEffect, useState } from 'react';
import truckIcon from '../../../assets/Icons/truck.svg';
import notificationIcon from '../../../assets/Icons/notifications.svg';

interface NotificationItem {
  id: string;
  type: 'dispatch' | 'job';
  title: string;
  subtitle: string;
}

// Placeholder for fetching notifications from backend
const fetchNotifications = async (): Promise<NotificationItem[]> => {
  // TODO: Replace this with your actual API call, e.g.:
  // const response = await fetch('/api/notifications');
  // return await response.json();
  return [
    {
      id: '1',
      type: 'dispatch',
      title: 'Order ID Kuchh_bhi is ready to dispatch.',
      subtitle: 'Order ORD-2023-003 is created and waiting for your approval.',
    },
    {
      id: '2',
      type: 'job',
      title: 'New Job list is created.',
      subtitle: 'Order ORD-2023-001 is ready for dispatch.',
    },
  ];
};

const Notifications: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications().then(setNotifications);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-20">
      <div className="relative w-full max-w-2xl mx-2 sm:mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-6">Notifications</h2>
        <div className="flex flex-col gap-8">
          {notifications.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={item.type === 'dispatch' ? truckIcon : notificationIcon}
                    alt="icon"
                    className="h-10 w-10 rounded-lg bg-[#F0F2F5]"
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                  <div className="text-gray-400 text-sm">{item.subtitle}</div>
                </div>
              </div>
              <div className="flex flex-row gap-3 mt-2 sm:mt-0">
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg transition hover:cursor-pointer">Approve</button>
                <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-5 py-2 rounded-lg transition hover:cursor-pointer">Hold</button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg border border-red-500 transition hover:cursor-pointer">Reject</button>
              </div>
            </div>
          ))}
        </div>
        {/* Approve all / Reject all buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition hover:cursor-pointer">Approve all</button>
          <button className="bg-red-500 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg border border-red-500 transition hover:cursor-pointer">Reject all</button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
