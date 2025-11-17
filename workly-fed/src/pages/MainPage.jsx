import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function MainPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("collapsed") === "true";
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem("collapsed", newValue);
      return newValue;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text-primary">
      <Header onMenuClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar collapsed={!sidebarCollapsed} />
        <main className="flex-1 p-6 overflow-auto bg-surface/40 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

