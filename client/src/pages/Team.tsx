import TopBar from "@/components/TopBar";

export default function Team() {
  return (
    <>
      <TopBar 
        title="Team" 
        description="Manage your team members and their roles"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Team Management</h3>
          <p className="text-gray-50">This page will contain team member management and role assignment features.</p>
        </div>
      </div>
    </>
  );
}
