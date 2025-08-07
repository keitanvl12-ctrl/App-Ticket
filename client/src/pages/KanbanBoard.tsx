import TopBar from "@/components/TopBar";

export default function KanbanBoard() {
  return (
    <>
      <TopBar 
        title="Kanban Board" 
        description="Drag and drop tickets to organize your workflow"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Kanban Board</h3>
          <p className="text-gray-50">This page will contain a drag-and-drop Kanban board for ticket management.</p>
        </div>
      </div>
    </>
  );
}
