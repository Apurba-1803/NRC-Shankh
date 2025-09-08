import React, { useEffect, useState } from 'react';

// Define the type for your dispatch order data
interface DispatchOrder {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  status: 'Pending' | 'Completed' | 'In Transit';
  dispatchDate: string;
}

// Placeholder for fetching data from backend
const fetchDispatchOrders = async (): Promise<DispatchOrder[]> => {
  // TODO: Replace with your actual API call
  return [
    {
      id: 'ORD-2023-001',
      customer: 'Acme Corp',
      product: 'Corrugated Boxes',
      quantity: 5000,
      status: 'Pending',
      dispatchDate: '2023-09-15',
    },
    {
      id: 'ORD-2023-002',
      customer: 'Global Retail',
      product: 'Folding Cartons',
      quantity: 3000,
      status: 'Completed',
      dispatchDate: '2023-09-10',
    },
    {
      id: 'ORD-2023-003',
      customer: 'Tech Solutions',
      product: 'Custom Packaging',
      quantity: 2000,
      status: 'In Transit',
      dispatchDate: '2023-09-12',
    },
    {
      id: 'ORD-2023-004',
      customer: 'Food Industries',
      product: 'Food Grade Cartons',
      quantity: 4000,
      status: 'Pending',
      dispatchDate: '2023-09-18',
    },
    {
      id: 'ORD-2023-005',
      customer: 'Pharma Inc',
      product: 'Pharmaceutical Boxes',
      quantity: 1500,
      status: 'Completed',
      dispatchDate: '2023-09-08',
    },
  ];
};

const statusChipClass = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-medium';
    case 'Pending':
      return 'bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-medium';
    case 'In Transit':
      return 'bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-medium';
    default:
      return 'bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm font-medium';
  }
};

const DispatchSummary: React.FC = () => {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);

  useEffect(() => {
    fetchDispatchOrders().then(setOrders);
  }, []);

  return (
    <div className="mt-10">
      <div className="bg-white rounded-xl shadow-sm p-0 border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 font-medium">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Dispatch Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-left text-gray-700 align-middle">{order.id}</td>
                  <td className="px-4 py-3 text-left align-middle">
                    <span className="text-[#00AEEF] hover:underline cursor-pointer">{order.customer}</span>
                  </td>
                  <td className="px-4 py-3 text-left align-middle">
                    <span className="text-[#00AEEF] hover:underline cursor-pointer">{order.product}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 align-middle">{order.quantity}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    <span className={statusChipClass(order.status)}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 align-middle">{order.dispatchDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DispatchSummary;
