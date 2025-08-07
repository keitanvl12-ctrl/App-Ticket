import TopBar from "@/components/TopBar";

export default function KanbanBoard() {
  return (
    <>
      <TopBar 
        title="Quadro Kanban" 
        description="Arraste e solte tickets para organizar seu fluxo de trabalho"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Quadro Kanban</h3>
          <p className="text-gray-50">Esta página conterá um quadro Kanban de arrastar e soltar para gerenciamento de tickets.</p>
        </div>
      </div>
    </>
  );
}
