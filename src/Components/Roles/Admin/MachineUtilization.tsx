import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface MachineStats {
  total: number;
  available: number;
  inUse: number;
}

interface MachineUtilizationDashboardProps {
  machineData: Record<string, MachineStats>;
  className?: string;
}

const MachineUtilizationDashboard: React.FC<MachineUtilizationDashboardProps> = ({ 
  machineData, 
  className = "" 
}) => {
  const [viewType, setViewType] = useState<'bar' | 'grid' | 'pie'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'utilization' | 'total'>('utilization');

  // Process and sort data
  // Process and sort data
const processedData = useMemo(() => {
  return Object.entries(machineData)
    .map(([originalMachine, stats]) => ({
      originalMachine, // ← Keep original for unique key
      machine: originalMachine.replace(/Machine$/, '').trim(), // Clean name for display
      ...stats,
      utilizationRate: stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0,
      availabilityRate: stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0,
      category: getMachineCategory(originalMachine)
    }))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.machine.localeCompare(b.machine);
        case 'utilization':
          return b.utilizationRate - a.utilizationRate;
        case 'total':
          return b.total - a.total;
        default:
          return b.utilizationRate - a.utilizationRate;
      }
    });
}, [machineData, sortBy]);


  // Categorize machines for better organization
  function getMachineCategory(machineName: string): string {
    const name = machineName.toLowerCase();
    if (name.includes('printing') || name.includes('heidelberg') || name.includes('lithrone')) return 'Printing';
    if (name.includes('corrugation')) return 'Corrugation';
    if (name.includes('flap') || name.includes('pasting')) return 'Pasting';
    if (name.includes('flute') || name.includes('laminator')) return 'Lamination';
    if (name.includes('punching') || name.includes('pinning')) return 'Punching';
    return 'Other';
  }

  // Get status color based on utilization rate
  function getStatusColor(utilizationRate: number): string {
    if (utilizationRate >= 80) return '#ef4444'; // High utilization - Red
    if (utilizationRate >= 50) return '#f59e0b'; // Medium utilization - Orange  
    if (utilizationRate >= 20) return '#10b981'; // Low utilization - Green
    return '#6b7280'; // No utilization - Gray
  }

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalMachines = processedData.reduce((sum, item) => sum + item.total, 0);
    const totalInUse = processedData.reduce((sum, item) => sum + item.inUse, 0);
    const totalAvailable = processedData.reduce((sum, item) => sum + item.available, 0);
    const avgUtilization = totalMachines > 0 ? Math.round((totalInUse / totalMachines) * 100) : 0;
    
    return {
      totalMachines,
      totalInUse,
      totalAvailable,
      avgUtilization,
      categories: [...new Set(processedData.map(item => item.category))].length
    };
  }, [processedData]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.machine}</p>
          <p className="text-sm text-blue-600">Total: {data.total}</p>
          <p className="text-sm text-green-600">Available: {data.available}</p>
          <p className="text-sm text-orange-600">In Use: {data.inUse}</p>
          <p className="text-sm text-gray-600">Utilization: {data.utilizationRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
  <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
  {/* Header */}
  <div className="p-4 sm:p-6 border-b border-gray-200">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Machine Utilization Dashboard</h2>
        <p className="text-gray-600 text-sm sm:text-base">Real-time machine availability and usage statistics</p>
      </div>
          
          {/* View Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
        >
          <option value="utilization">Sort by Utilization</option>
          <option value="total">Sort by Total</option>
          <option value="name">Sort by Name</option>
        </select>
        
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          {(['grid', 'bar', 'pie'] as const).map(type => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-3 py-2 text-sm font-medium flex-1 sm:flex-none ${
                viewType === type 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.totalMachines}</div>
            <div className="text-sm text-blue-800">Total Machines</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summaryStats.totalAvailable}</div>
            <div className="text-sm text-green-800">Available</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summaryStats.totalInUse}</div>
            <div className="text-sm text-orange-800">In Use</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.avgUtilization}%</div>
            <div className="text-sm text-purple-800">Avg Utilization</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{summaryStats.categories}</div>
            <div className="text-sm text-gray-800">Categories</div>
          </div>
        </div>
      </div>

      {/* Content based on view type */}
      <div className="p-6">
        {viewType === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {processedData.map((machine) => (
              <div key={machine.originalMachine} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{machine.machine}</h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mt-1">
                      {machine.category}
                    </span>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getStatusColor(machine.utilizationRate) }}
                  >
                    {machine.utilizationRate}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Total</span>
                    <span className="font-medium">{machine.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-600">Available</span>
                    <span className="font-medium text-green-600">{machine.available}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-orange-600">In Use</span>
                    <span className="font-medium text-orange-600">{machine.inUse}</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${machine.utilizationRate}%`,
                        backgroundColor: getStatusColor(machine.utilizationRate)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewType === 'bar' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="machine" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="available" fill="#10b981" name="Available" />
                <Bar dataKey="inUse" fill="#f59e0b" name="In Use" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewType === 'pie' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Utilization */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Overall Machine Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
  data={[
    { name: 'Available', value: summaryStats.totalAvailable, fill: '#10b981' },
    { name: 'In Use', value: summaryStats.totalInUse, fill: '#f59e0b' }
  ]}
  cx="50%"
  cy="50%"
  outerRadius={80}
  dataKey="value"
  label={({ name, percent }: { name?: string; percent?: number }) => 
    `${name || 'Unknown'} ${percent ? (percent * 100).toFixed(0) : '0'}%`
  }
>
  <Cell fill="#10b981" />
  <Cell fill="#f59e0b" />
</Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Machines by Category</h3>
              <div className="space-y-3">
                {Object.entries(
                  processedData.reduce((acc, machine) => {
                    if (!acc[machine.category]) {
                      acc[machine.category] = { total: 0, inUse: 0, available: 0 };
                    }
                    acc[machine.category].total += machine.total;
                    acc[machine.category].inUse += machine.inUse;
                    acc[machine.category].available += machine.available;
                    return acc;
                  }, {} as Record<string, { total: number; inUse: number; available: number }>)
                ).map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-green-600">{stats.available} available</span>
                      <span className="text-sm text-orange-600">{stats.inUse} in use</span>
                      <span className="text-sm text-gray-600">{stats.total} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineUtilizationDashboard;
