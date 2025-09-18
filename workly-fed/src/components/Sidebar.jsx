import {
  FaHome,
  FaSearch,
  FaFileExcel,
  FaDollarSign,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

const navItems = [
  { icon: <FaHome />, label: "Início" },
  { icon: <FaSearch />, label: "Buscar" },
  { icon: <FaDollarSign />, label: "Meus Contratos" },
  { icon: <FaFileExcel />, label: "Relatórios" },
  { icon: <FaGear />, label: "Configurações" },
];

export default function Sidebar({ collapsed }) {
  return (
    <aside
      className={`h-full bg-background border-r border-border transition-all duration-200 flex flex-col ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      <nav className="flex-1 mt-2">
        {navItems.map((item, idx) => (
          <div
            key={item.label}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-100 hover:text-primary transition"
          >
            <span className="text-3xl">{item.icon}</span>
            {!collapsed && (
              <span className="text-3x1 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-border text-xs text-gray-400 min-h-[56px] flex items-end" style={{ minHeight: '56px' }}>
        {!collapsed ? (
          <div>
            <div>Versão: 1.0.0</div>
            <div>Release: 17/09/2025</div>
          </div>
        ) : (
          <span className="mx-auto">v1.0.0</span>
        )}
      </div>
    </aside>
  );
}
