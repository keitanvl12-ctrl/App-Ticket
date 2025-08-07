import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  List, 
  Columns, 
  BarChart3, 
  Users, 
  Settings, 
  Ticket,
  MoreVertical 
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tickets", icon: List, label: "All Tickets" },
  { path: "/kanban", icon: Columns, label: "Kanban Board" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/team", icon: Users, label: "Team" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-20 flex-shrink-0 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-4 border-b border-gray-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Ticket className="text-white" size={16} />
          </div>
          <span className="text-lg font-semibold text-gray-100">TicketFlow Pro</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-70 hover:bg-gray-10"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-20 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
            <span>JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-100 truncate">John Doe</p>
            <p className="text-xs text-gray-50 truncate">Admin</p>
          </div>
          <button className="text-gray-50 hover:text-gray-70 transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
