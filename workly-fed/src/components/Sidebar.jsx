import {
  FaHome,
  FaSearch,
  FaFileExcel,
  FaDollarSign,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom"; 

const navItems = [
  { icon: <FaHome />, label: "Início", path: "/home" },
  { icon: <FaSearch />, label: "Buscar", path: "/home/search" },
  { icon: <FaDollarSign />, label: "Meus Contratos", path: "/home/contracts" },
  { icon: <FaFileExcel />, label: "Relatórios", path: "/home/reports" },
  { icon: <FaGear />, label: "Configurações", path: "/home/settings" },
];

export default function Sidebar({ collapsed }) {
  const { pathname } = useLocation();

  return (
    <aside
      className={`h-full bg-background border-r border-border transition-all duration-200 flex flex-col ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      <nav className="flex-1 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition 
                ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-gray-100 hover:text-primary"
                }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {!collapsed && (
                <span className="text-base font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border text-xs text-gray-400 min-h-[56px] flex items-end">
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
