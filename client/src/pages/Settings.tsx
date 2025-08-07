import TopBar from "@/components/TopBar";

export default function Settings() {
  return (
    <>
      <TopBar 
        title="Configurações" 
        description="Configure seu sistema de gerenciamento de tickets"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Configurações do Sistema</h3>
          <p className="text-gray-50">Esta página conterá configurações do sistema e preferências do usuário.</p>
        </div>
      </div>
    </>
  );
}
