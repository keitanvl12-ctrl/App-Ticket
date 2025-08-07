import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor,
  iconBgColor 
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-error";
      default:
        return "text-gray-50";
    }
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "↗";
    if (changeType === "negative") return "↘";
    return "";
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-20/40 p-6 card-hover shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-50 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-100 mb-2">{value}</p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getChangeColor()} bg-opacity-10`}>
            <span className="mr-1 text-lg">{getChangeIcon()}</span>
            {change}
          </div>
        </div>
        <div className={`w-16 h-16 ${iconBgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className={iconColor} size={28} />
        </div>
      </div>
    </div>
  );
}
