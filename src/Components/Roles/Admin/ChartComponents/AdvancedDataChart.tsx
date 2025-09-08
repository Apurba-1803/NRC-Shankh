import React, { useState, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation
);

interface AdvancedDataChartProps {
  data: any[];
  dataKeys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey: string;
  title: string;
  chartType?: 'line' | 'bar';
  height?: number;
  className?: string;
  maxDataPoints?: number;
  enableVirtualization?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
}

const AdvancedDataChart: React.FC<AdvancedDataChartProps> = ({
  data,
  dataKeys,
  xAxisKey,
  title,
  chartType = 'line',
  height = 400,
  className = '',
  maxDataPoints = 2000,
  enableVirtualization = true,
  enableFiltering = true,
  enableSearch = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataKeys, setSelectedDataKeys] = useState<string[]>(dataKeys.map(k => k.key));
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(500);

  // Advanced data filtering and optimization
  const processedData = useMemo(() => {
    let filteredData = data;

    // Search filtering
    if (enableSearch && searchTerm) {
      filteredData = data.filter(item => {
        const searchValue = String(item[xAxisKey]).toLowerCase();
        return searchValue.includes(searchTerm.toLowerCase());
      });
    }

    // Data key filtering
    if (selectedDataKeys.length !== dataKeys.length) {
      filteredData = filteredData.map(item => {
        const filteredItem: any = { [xAxisKey]: item[xAxisKey] };
        selectedDataKeys.forEach(key => {
          filteredItem[key] = item[key];
        });
        return filteredItem;
      });
    }

    return filteredData;
  }, [data, searchTerm, selectedDataKeys, dataKeys, xAxisKey, enableSearch]);

  // Virtual scrolling for large datasets
  const virtualizedData = useMemo(() => {
    if (!enableVirtualization || processedData.length <= maxDataPoints) {
      return processedData;
    }

    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, processedData.length);
    return processedData.slice(startIndex, endIndex);
  }, [processedData, enableVirtualization, maxDataPoints, currentPage, itemsPerPage]);

  // Optimize data for chart rendering
  const optimizedData = useMemo(() => {
    if (virtualizedData.length <= maxDataPoints) return virtualizedData;
    
    // Smart sampling for very large datasets
    const step = Math.ceil(virtualizedData.length / maxDataPoints);
    return virtualizedData.filter((_, index) => index % step === 0);
  }, [virtualizedData, maxDataPoints]);

  const chartData = useMemo(() => ({
    labels: optimizedData.map(item => {
      const value = item[xAxisKey];
      if (typeof value === 'string') {
        // Format dates nicely
        if (value.includes('T') || value.includes('-')) {
          try {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch {
            return value;
          }
        }
        // Truncate long strings
        return value.length > 15 ? value.substring(0, 15) + '...' : value;
      }
      return value;
    }),
    datasets: dataKeys
      .filter(key => selectedDataKeys.includes(key.key))
      .map(({ key, color, name }) => ({
        label: name,
        data: optimizedData.map(item => item[key] as number),
        borderColor: color,
        backgroundColor: chartType === 'bar' ? color : color + '20',
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: optimizedData.length > 200 ? 0 : 3,
        pointHoverRadius: 6,
        borderWidth: 3,
        borderRadius: chartType === 'bar' ? 4 : undefined,
        barThickness: chartType === 'bar' ? 'flex' as const : undefined,
        maxBarThickness: chartType === 'bar' ? 50 : undefined,
      })),
  }), [optimizedData, dataKeys, selectedDataKeys, xAxisKey, chartType]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, index: number) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 3,
              pointStyle: chartType === 'line' ? 'circle' : 'rect',
              hidden: !chart.isDatasetVisible(index),
              index: index,
            }));
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        cornerRadius: 10,
        padding: 15,
        displayColors: true,
        callbacks: {
          title: (tooltipItems: any[]) => {
            return `${xAxisKey}: ${tooltipItems[0].label}`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      },
      decimation: {
        enabled: true,
        algorithm: 'min-max' as const,
        samples: 100,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.08)',
          drawBorder: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: { size: 10 },
          maxTicksLimit: 12,
        },
        title: {
          display: true,
          text: xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1),
          font: { size: 12, weight: '600' },
          color: '#374151'
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.08)',
          drawBorder: false,
        },
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          callback: (value: any) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Value',
          font: { size: 12, weight: '600' },
          color: '#374151'
        }
      },
    },
    animation: {
      duration: optimizedData.length > 1000 ? 0 : 800,
    },
    responsiveAnimationDuration: 0,
  }), [xAxisKey, chartType, optimizedData.length]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentRange = `${(currentPage * itemsPerPage) + 1}-${Math.min((currentPage + 1) * itemsPerPage, processedData.length)}`;

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  }, [totalPages]);

  const toggleDataKey = useCallback((key: string) => {
    setSelectedDataKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Data Key Toggle */}
          {enableFiltering && (
            <div className="flex flex-wrap gap-2">
              {dataKeys.map(({ key, color, name }) => (
                <button
                  key={key}
                  onClick={() => toggleDataKey(key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    selectedDataKeys.includes(key)
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor: selectedDataKeys.includes(key) ? color : 'transparent'
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Info */}
      <div className="flex flex-wrap items-center justify-between mb-4 text-sm text-gray-600">
        <div>
          Showing {currentRange} of {processedData.length.toLocaleString()} data points
          {processedData.length > maxDataPoints && (
            <span className="ml-2 text-blue-600">
              (Optimized: {optimizedData.length.toLocaleString()})
            </span>
          )}
        </div>
        
        {enableVirtualization && totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ←
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: height }} className="relative">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
        
        {optimizedData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No data available</div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      {processedData.length > 10000 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>💡 Performance Tip:</strong> This chart is handling {processedData.length.toLocaleString()} data points. 
            Consider using date filters to reduce the dataset size for better performance.
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDataChart; 