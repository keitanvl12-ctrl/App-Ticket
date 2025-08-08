import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./NewSidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex pt-16">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
