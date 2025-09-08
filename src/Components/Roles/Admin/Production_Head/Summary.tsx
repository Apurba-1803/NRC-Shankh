import React, { useEffect, useState } from 'react';

// Define the type for your summary data
interface SummaryData {
  totalOrders: number;
  inProgress: number;
  completedToday: number;
}

// Placeholder for fetching data from backend
const fetchSummaryData = async (): Promise<SummaryData> => {
  // TODO: Replace this with your actual API call, e.g.:
  // const response = await fetch('/api/production/summary');
  // return await response.json();
  return {
    totalOrders: 125,
    inProgress: 45,
    completedToday: 15,
  };
};

const cardConfig = [
  {
    key: 'totalOrders',
    title: 'Total Production Orders',
  },
  {
    key: 'inProgress',
    title: 'Orders in Progress',
  },
  {
    key: 'completedToday',
    title: 'Orders Completed Today',
  },
] as const;

type CardKey = typeof cardConfig[number]['key'];

const Summary: React.FC = () => {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    // Fetch data from backend
    fetchSummaryData().then(setData);
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-10">
      {cardConfig.map(({ key, title }) => (
        <div
          key={key}
          className="bg-gray-100 rounded-xl p-6 min-w-[220px] flex-1 max-w-xs shadow-sm"
        >
          <div className="text-gray-700 font-medium mb-2">{title}</div>
          <div className="text-2xl font-bold mb-1">
            {data ? data[key as CardKey] : <span className="text-gray-400">--</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Summary;
