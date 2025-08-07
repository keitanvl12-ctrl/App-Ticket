import { useState } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateTicketModal from "./CreateTicketModal";

interface TopBarProps {
  title: string;
  description?: string;
}

export default function TopBar({ title, description }: TopBarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <header className="bg-white border-b border-gray-20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
            {description && (
              <div className="text-sm text-gray-50">{description}</div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 bg-gray-10 border-gray-20 focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-3 top-3 text-gray-50" size={16} />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-gray-50 hover:text-gray-70">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Create Ticket Button */}
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white font-medium"
            >
              <Plus size={16} className="mr-2" />
              Create Ticket
            </Button>
          </div>
        </div>
      </header>

      <CreateTicketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}
