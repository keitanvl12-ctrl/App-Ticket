import { ReactNode, useState } from "react";
import Header from "./Header";
import { ExpandableSidebar } from "./ExpandableSidebar";
import { useLocation } from 'wouter';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      <ExpandableSidebar currentPath={location} onNavigate={setLocation} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
