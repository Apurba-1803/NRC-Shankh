import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation
);

interface LineChartData {
  [key: string]: string | number;
}

interface LineChartComponentProps {
  data: LineChartData[];
  dataKeys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisKey: string;
  title: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
  maxDataPoints?: number;
  showArea?: boolean;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  data,
  dataKeys,
  xAxisKey,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
  maxDataPoints = 1000,
  showArea = false
}) => {
  // Optimize data for large datasets
  const optimizedData = useMemo(() => {
    if (data.length <= maxDataPoints) return data;
    
    // Sample data for large datasets to maintain performance
    const step = Math.ceil(data.length / maxDataPoints);
    return data.filter((_, index) => index % step === 0);
  }, [data, maxDataPoints]);

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
        return value.length > 20 ? value.substring(0, 20) + '...' : value;
      }
      return value;
    }),
    datasets: dataKeys.map(({ key, color, name }) => ({
      label: name,
      data: optimizedData.map(item => item[key] as number),
      borderColor: color,
      backgroundColor: showArea ? color + '20' : 'transparent',
      fill: showArea,
      tension: 0.4,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: optimizedData.length > 100 ? 0 : 4, // Hide points for large datasets
      pointHoverRadius: 6,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3,
      borderWidth: 3,
      // Performance optimizations
      segment: {
        borderColor: (ctx: any) => {
          if (ctx.p1.parsed.y < ctx.p0.parsed.y) {
            return '#EF4444'; // Red for decreasing values
          }
          return color; // Original color for increasing values
        },
      },
    })),
  }), [optimizedData, dataKeys, xAxisKey, showArea]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, index: number) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 3,
              pointStyle: 'circle',
              hidden: !chart.isDatasetVisible(index),
              index: index,
            }));
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems: any[]) => {
            return `Date: ${tooltipItems[0].label}`;
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
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 10
          },
          maxTicksLimit: 10, // Limit x-axis labels for large datasets
        },
        title: {
          display: true,
          text: 'Time Period',
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        }
      },
      y: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        beginAtZero: true,
        suggestedMax: 8, 
        ticks: {
          font: {
            size: 10
          },
          stepSize: 1,
          callback: (value: any) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Count / Quantity',
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        }
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      },
    },
    animation: {
      duration: optimizedData.length > 500 ? 0 : 1000, // Disable animation for large datasets
    },
    responsiveAnimationDuration: 0,
  }), [showGrid, showLegend, optimizedData.length]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        {data.length > maxDataPoints && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Showing {optimizedData.length.toLocaleString()} of {data.length.toLocaleString()} data points
          </div>
        )}
      </div>
      <div style={{ height: height }} className="relative">
        <Line data={chartData} options={options} />
        {optimizedData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No data available</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChartComponent; 