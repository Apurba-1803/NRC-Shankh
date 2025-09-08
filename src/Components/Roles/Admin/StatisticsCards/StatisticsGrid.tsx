import React from 'react';
import { TrendingUp, CheckCircle, PlayCircle, Clock, Users } from 'lucide-react';
import StatisticsCard from './StatisticsCard';

interface StatisticsGridProps {
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  plannedJobs: number;
  // totalSteps: number;
  // completedSteps: number;
  activeUsers: number;
  // efficiency: number;
  className?: string;
  onTotalJobsClick?: () => void;
  onCompletedJobsClick?: () => void;
  onInProgressJobsClick?: () => void;
  onPlannedJobsClick?: () => void;
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  totalJobs,
  completedJobs,
  inProgressJobs,
  plannedJobs,
  // totalSteps,
  // completedSteps,
  activeUsers,
  // efficiency,
  className = '',
  onTotalJobsClick,
  onCompletedJobsClick,
  onInProgressJobsClick,
  onPlannedJobsClick
}) => {
  const stats = [
    {
      title: 'Total Jobs',
      value: totalJobs,
      icon: TrendingUp,
      iconColor: 'text-[#00AEEF]',
      iconBgColor: 'bg-blue-100',
      borderColor: 'border-[#00AEEF]',
      onClick: onTotalJobsClick,
      isClickable: !!onTotalJobsClick
    },
    {
      title: 'Completed Jobs',
      value: completedJobs,
      icon: CheckCircle,
      iconColor: 'text-[#10B981]',
      iconBgColor: 'bg-green-100',
      borderColor: 'border-[#10B981]',
      onClick: onCompletedJobsClick,
      isClickable: !!onCompletedJobsClick
    },
    {
      title: 'In Progress',
      value: inProgressJobs,
      icon: PlayCircle,
      iconColor: 'text-[#F59E0B]',
      iconBgColor: 'bg-yellow-100',
      borderColor: 'border-[#F59E0B]',
      onClick: onInProgressJobsClick,
      isClickable: !!onInProgressJobsClick
    },
    {
      title: 'Planned Jobs',
      value: plannedJobs,
      icon: Clock,
      iconColor: 'text-[#6B7280]',
      iconBgColor: 'bg-gray-100',
      borderColor: 'border-[#6B7280]',
      onClick: onPlannedJobsClick,
      isClickable: !!onPlannedJobsClick
    },
    // {
    //   title: 'Total Steps',
    //   value: totalSteps,
    //   icon: BarChart3,
    //   iconColor: 'text-[#3B82F6]',
    //   iconBgColor: 'bg-blue-100',
    //   borderColor: 'border-[#3B82F6]'
    // },
    // {
    //   title: 'Completed Steps',
    //   value: completedSteps,
    //   icon: Target,
    //   iconColor: 'text-[#8B5CF6]',
    //   iconBgColor: 'bg-purple-100',
    //   borderColor: 'border-[#8B5CF6]'
    // },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: Users,
      iconColor: 'text-[#EC4899]',
      iconBgColor: 'bg-pink-100',
      borderColor: 'border-[#EC4899]'
    },
    // {
    //   title: 'Efficiency',
    //   value: `${efficiency}%`,
    //   icon: TrendingUp,
    //   iconColor: 'text-[#06B6D4]',
    //   iconBgColor: 'bg-cyan-100',
    //   borderColor: 'border-[#06B6D4]'
    // }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatisticsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconColor={stat.iconColor}
          iconBgColor={stat.iconBgColor}
          borderColor={stat.borderColor}
          onClick={stat.onClick}
          isClickable={stat.isClickable}
        />
      ))}
    </div>
  );
};

export default StatisticsGrid; 