import React from 'react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBgColor: string;
  borderColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  borderColor,
  trend,
  className = '',
  onClick,
  isClickable = false
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} ${className} ${
        isClickable ? 'group cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-gray-50 hover:border-2 hover:border-gray-200' : ''
      }`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <Icon className={`${iconColor} ${isClickable ? 'group-hover:opacity-80' : ''}`} size={24} />
          </div>
          <div className="ml-4">
            <p className={`text-sm font-medium ${isClickable ? 'text-gray-600 group-hover:text-gray-800' : 'text-gray-600'}`}>{title}</p>
            <p className={`text-2xl font-bold ${isClickable ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-900'}`}>{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-500 ml-1">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard; 