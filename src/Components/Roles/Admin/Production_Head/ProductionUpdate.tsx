import React, { useEffect, useState } from 'react';

// Define the type for your data
interface ProductionJob {
  id: string;
  customer: string;
  deadline: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

// Placeholder for fetching data from backend
const fetchProductionUpdate = async (): Promise<ProductionJob[]> => {
  // TODO: Replace with your actual API call
  return [
    {
      id: 'JO-2024-07-001',
      customer: 'Acme Corp',
      deadline: '2024-07-15',
      status: 'Planning',
      priority: 'High',
    },
    {
      id: 'JO-2024-07-002',
      customer: 'Beta Industries',
      deadline: '2024-07-20',
      status: 'Planning',
      priority: 'Medium',
    },
    {
      id: 'JO-2024-07-003',
      customer: 'Gamma Solutions',
      deadline: '2024-07-25',
      status: 'Planning',
      priority: 'Low',
    },
    // Add more rows to test scrolling
  ];
};

const chipClass =
  'bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-medium text-center';

const ProductionUpdate: React.FC = () => {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);

  useEffect(() => {
    fetchProductionUpdate().then(setJobs);
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Production Overview</h2>
      <div className="bg-white rounded-xl shadow-sm p-0 border border-gray-200">
        <div className="overflow-x-auto" style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 font-medium">
                <th className="px-4 py-3 text-center">Job Order ID</th>
                <th className="px-4 py-3 text-center">Customer</th>
                <th className="px-4 py-3 text-center">Deadline</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-center text-gray-700 align-middle">{job.id}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    <span className="text-[#00AEEF] hover:underline cursor-pointer">{job.customer}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 align-middle">{job.deadline}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    <span className={chipClass}>{job.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <span className={chipClass}>{job.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <span className="text-gray-500 hover:underline cursor-pointer">Edit</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionUpdate;
