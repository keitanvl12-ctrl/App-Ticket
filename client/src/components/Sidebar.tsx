import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  List, 
  Columns, 
  BarChart3, 
  Users, 
  Settings, 
  Ticket,
  LogOut,
  User,
  Bell
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Painel" },
  { path: "/tickets", icon: List, label: "Todos os Tickets" },
  { path: "/kanban", icon: Columns, label: "Quadro Kanban" },
  { path: "/analytics", icon: BarChart3, label: "Análises" },
  { path: "/team", icon: Users, label: "Equipe" },
  { path: "/settings", icon: Settings, label: "Configurações" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl border-r border-gray-20/30 flex-shrink-0 flex flex-col shadow-2xl">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-20/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Ticket className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">TicketFlow</h1>
            <p className="text-xs font-medium text-gray-50 tracking-widest uppercase">Pro</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center space-x-4 px-4 py-3 rounded-2xl font-medium transition-all duration-300 group relative overflow-hidden cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-primary/15 to-secondary/10 text-primary shadow-lg border border-primary/20"
                    : "text-gray-70 hover:bg-gradient-to-r hover:from-gray-10 hover:to-gray-10/60 hover:text-gray-100 hover:shadow-md hover:scale-[1.02]"
                }`}
              >
                <Icon size={22} className={`${isActive ? "text-primary" : "group-hover:text-primary/80"} transition-colors`} />
                <span className={`font-medium ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-20/30 glass-effect m-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-xl">
              <span>JS</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white shadow-md" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-100 truncate">João Silva</p>
            <p className="text-xs text-gray-50 truncate flex items-center mt-1">
              <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
              Administrador Online
            </p>
          </div>
          <div className="flex space-x-1">
            <button className="p-2 text-gray-50 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 hover:shadow-md">
              <Bell size={16} />
            </button>
            <button className="p-2 text-gray-50 hover:text-error hover:bg-error/10 rounded-xl transition-all duration-200 hover:shadow-md">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
