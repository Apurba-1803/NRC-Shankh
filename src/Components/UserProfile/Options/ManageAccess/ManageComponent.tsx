import React, { useState, useEffect } from 'react';
import deleteIcon from '../../../../assets/Icons/delete.svg';
import CreateNewId from '../CreateNewId'; // Adjust the import path as needed

// Map roles to their API endpoints
const roleEndpoints: Record<string, string | undefined> = {
  Admin: undefined,
  Planner: undefined,
  'Printing Manager': undefined,
  'Production Head': undefined,
  'Dispatch Executive': undefined,
  'QC Manager': undefined,
  // Add more as needed
};

const mockData = [
  { id: 1, name: "Liam Harper", role: "" },
  { id: 2, name: "Olivia Bennett", role: "" },
  { id: 3, name: "Noah Carter", role: "" },
  { id: 4, name: "Ava Mitchell", role: "" },
  { id: 5, name: "Ethan Parker", role: "" },
];

interface ManageComponentProps {
  role: string;
  onClose: () => void;
}

const ManageComponent: React.FC<ManageComponentProps> = ({ role, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const endpoint = roleEndpoints[role];
    if (!endpoint) {
      // Use mock data if no endpoint
      setTimeout(() => {
        setData(mockData.map(user => ({ ...user, role })));
        setLoading(false);
      }, 500);
      return;
    }

    // Fetch real data from backend
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(fetchedData => setData(fetchedData))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [role]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-30">
      <div className="relative w-full max-w-2xl mx-2 sm:mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full max-w-2xl px-8 pt-10 pb-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-center">Manage {role}</h2>
          <p className="text-gray-500 text-center mb-6">Manage user accounts, roles, and permissions within the system.</p>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="w-full bg-white rounded-xl shadow border border-gray-200 overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="min-w-full text-sm text-center">
                <thead>
                  <tr className="bg-white">
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">User</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Role</th>

                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((user, idx) => (
                    <tr key={user.id || idx} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-6 py-4 align-middle text-center text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className="inline-block bg-gray-100 px-4 py-1 rounded-full font-semibold text-gray-800 text-center">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-middle text-center flex items-center justify-center gap-4">
                        <button className="text-[#00AEEF] font-semibold hover:underline focus:outline-none hover:cursor-pointer">Edit</button>
                        <button className="hover:opacity-70 focus:outline-none hover:cursor-pointer">
                          <img src={deleteIcon} alt="Delete" className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="w-full flex justify-end mt-6">
            <button
              className="bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition hover:cursor-pointer shadow"
              onClick={() => setShowCreateUser(true)}
            >
              Add User
            </button>
          </div>
        </div>
        {/* Add User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-40">
            <div className="relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowCreateUser(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <CreateNewId onClose={() => setShowCreateUser(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageComponent;
