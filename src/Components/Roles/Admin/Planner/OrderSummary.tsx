import React, { useEffect, useState } from 'react';

// Define the type for your data
interface OrderSummaryData {
  scheduled: { count: number; change: number };
  pending: { count: number; change: number };
  completed: { count: number; change: number };
}

// Placeholder for fetching data from backend
const fetchOrderSummary = async (): Promise<OrderSummaryData> => {
  // TODO: Replace this with your actual API call, e.g.:
  // const response = await fetch('/api/orders/summary');
  // return await response.json();
  return {
    scheduled: { count: 120, change: 10 },
    pending: { count: 45, change: -5 },
    completed: { count: 75, change: 15 },
  };
};

const cardConfig = [
  {
    key: 'scheduled',
    title: 'Scheduled Orders',
  },
  {
    key: 'pending',
    title: 'Pending Orders',
  },
  {
    key: 'completed',
    title: 'Completed Orders',
  },
] as const;

const OrderSummary: React.FC = () => {
  const [data, setData] = useState<OrderSummaryData | null>(null);

  useEffect(() => {
    // Fetch data from backend
    fetchOrderSummary().then(setData);
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-10">
      {cardConfig.map(({ key, title }) => (
        <div
          key={key}
          className="bg-white border border-gray-200 rounded-xl p-6 min-w-[220px] flex-1 max-w-xs shadow-sm"
        >
          <div className="text-gray-700 font-medium mb-2">{title}</div>
          <div className="text-2xl font-bold mb-1">
            {data ? data[key].count : <span className="text-gray-400">--</span>}
          </div>
          <div
            className={`text-sm font-semibold ${
              data
                ? data[key].change > 0
                  ? 'text-green-600'
                  : data[key].change < 0
                  ? 'text-red-500'
                  : 'text-gray-500'
                : 'text-gray-300'
            }`}
          >
            {data
              ? `${data[key].change > 0 ? '+' : ''}${data[key].change}%`
              : '--'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummary;
