import TopBar from "@/components/TopBar";

export default function Analytics() {
  return (
    <>
      <TopBar 
        title="Analytics" 
        description="Deep insights into your ticket management performance"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-50">This page will contain detailed analytics and reporting features.</p>
        </div>
      </div>
    </>
  );
}
