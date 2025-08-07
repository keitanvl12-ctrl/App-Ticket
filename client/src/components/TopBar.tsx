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
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-20/40 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-3xl font-bold text-gradient">{title}</h1>
              {description && (
                <p className="text-sm text-gray-50 mt-1 font-medium">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-12 pr-4 py-3 bg-gray-10/60 border-gray-20/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-2xl text-sm font-medium placeholder:text-gray-50 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50" size={18} />
            </div>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-gray-50 hover:text-primary hover:bg-primary/10 rounded-2xl w-12 h-12 shadow-sm"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-error to-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-pulse">
                3
              </span>
            </Button>

            {/* Create Ticket Button */}
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="gradient-primary hover:shadow-lg text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <Plus size={18} className="mr-2" />
              Criar Ticket
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
