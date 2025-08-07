import TopBar from "@/components/TopBar";

export default function AllTickets() {
  return (
    <>
      <TopBar 
        title="All Tickets" 
        description="View and manage all support tickets"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">All Tickets View</h3>
          <p className="text-gray-50">This page will contain a comprehensive tickets table with filtering and sorting capabilities.</p>
        </div>
      </div>
    </>
  );
}
