import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  return (
    <div className="flex flex-col h-screen">
      <Header onMenuClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="flex flex-1 min-h-0">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="flex-1 p-6 overflow-auto">
          {/* Adicione o conteúdo das páginas aqui */}
        </main>
      </div>
    </div>
  );
}

export default App;
