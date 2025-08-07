import { useQuery } from "@tanstack/react-query";
import type { PriorityStats } from "@shared/schema";

const priorityConfig = {
  critical: { color: "bg-error", textColor: "text-error" },
  high: { color: "bg-warning", textColor: "text-warning" },
  medium: { color: "bg-primary", textColor: "text-primary" },
  low: { color: "bg-success", textColor: "text-success" },
};

export default function PriorityBreakdown() {
  const { data: priorityStats, isLoading } = useQuery<PriorityStats>({
    queryKey: ["/api/dashboard/priority-stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-20 rounded-full"></div>
                <div className="h-4 bg-gray-20 rounded w-16"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-20 rounded-full h-2"></div>
                <div className="h-4 bg-gray-20 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!priorityStats) {
    return (
      <div className="text-center text-gray-50">
        No priority data available
      </div>
    );
  }

  const priorities = [
    { key: "critical", label: "Critical", ...priorityStats.critical },
    { key: "high", label: "High", ...priorityStats.high },
    { key: "medium", label: "Medium", ...priorityStats.medium },
    { key: "low", label: "Low", ...priorityStats.low },
  ];

  return (
    <div className="space-y-4">
      {priorities.map((priority) => {
        const config = priorityConfig[priority.key as keyof typeof priorityConfig];
        
        return (
          <div key={priority.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${config.color} rounded-full`}></div>
              <span className="text-sm text-gray-70">{priority.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-20 rounded-full h-2">
                <div 
                  className={`${config.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${priority.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-100 w-8 text-right">
                {priority.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
