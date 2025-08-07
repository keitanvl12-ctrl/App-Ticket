import { useQuery } from "@tanstack/react-query";
import { Eye, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import type { TicketWithDetails } from "@shared/schema";

const statusConfig = {
  open: { color: "bg-primary/10 text-primary", label: "Open" },
  in_progress: { color: "bg-warning/10 text-warning", label: "In Progress" },
  resolved: { color: "bg-success/10 text-success", label: "Resolved" },
  closed: { color: "bg-gray-50/10 text-gray-70", label: "Closed" },
};

const priorityConfig = {
  low: { color: "bg-success/10 text-success", label: "Low" },
  medium: { color: "bg-primary/10 text-primary", label: "Medium" },
  high: { color: "bg-warning/10 text-warning", label: "High" },
  critical: { color: "bg-error/10 text-error", label: "Critical" },
};

export default function RecentTicketsTable() {
  const { data: tickets, isLoading } = useQuery<TicketWithDetails[]>({
    queryKey: ["/api/tickets"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-20">
        <div className="p-6 border-b border-gray-20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Recent Tickets</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-50">Loading tickets...</div>
        </div>
      </div>
    );
  }

  const recentTickets = tickets?.slice(0, 5) || [];

  return (
    <div className="bg-white rounded-lg border border-gray-20">
      <div className="p-6 border-b border-gray-20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Recent Tickets</h2>
          <Button variant="ghost" className="text-primary hover:text-primary-hover font-medium text-sm">
            View All →
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-20">
              <th className="text-left p-4 text-sm font-medium text-gray-70">Ticket ID</th>
              <th className="text-left p-4 text-sm font-medium text-gray-70">Subject</th>
              <th className="text-left p-4 text-sm font-medium text-gray-70">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-70">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-gray-70">Assignee</th>
              <th className="text-left p-4 text-sm font-medium text-gray-70">Created</th>
              <th className="text-left p-4 text-sm font-medium text-gray-70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-50">
                  No tickets found
                </td>
              </tr>
            ) : (
              recentTickets.map((ticket) => {
                const statusStyle = statusConfig[ticket.status as keyof typeof statusConfig];
                const priorityStyle = priorityConfig[ticket.priority as keyof typeof priorityConfig];
                
                return (
                  <tr key={ticket.id} className="border-b border-gray-20 hover:bg-gray-10 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-medium text-primary">
                        {ticket.ticketNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-100">{ticket.subject}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle?.color}`}>
                        {statusStyle?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle?.color}`}>
                        {priorityStyle?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                          {ticket.assignedToUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <span className="text-sm text-gray-70">
                          {ticket.assignedToUser?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-50">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-50 hover:text-primary transition-colors p-1 h-auto"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-50 hover:text-primary transition-colors p-1 h-auto"
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
