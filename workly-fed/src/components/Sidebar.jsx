import { FaHome, FaSearch, FaFileExcel, FaDollarSign } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: <FaHome />, label: "Início", path: "/home" },
  { icon: <FaSearch />, label: "Buscar", path: "/home/search" },
  { icon: <FaDollarSign />, label: "Meus Contratos", path: "/home/contracts" },
  { icon: <FaFileExcel />, label: "Relatórios", path: "/home/reports" },
  // { icon: <FaGear />, label: "Configurações", path: "/home/settings" },
];

export default function Sidebar({ collapsed }) {
  const { pathname } = useLocation();
  return (
    <aside
      className={`h-full bg-surface border-r border-border transition-all duration-300
      flex flex-col ${collapsed ? "w-20" : "w-56"}`}
    >
      <nav className="flex-1 mt-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-md mx-2
                transition-colors text-text-primary
                ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                    : "hover:bg-primary/10 hover:text-primary"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <footer className="px-4 py-3 border-t border-border text-xs opacity-70 mb-3">
        {!collapsed ? (
          <div>
            <p>Versão: 1.0.0</p>
            <p>Release: 17/11/2025</p>
          </div>
        ) : (
          <span className="block text-center">v1.0.0</span>
        )}
      </footer>
    </aside>
  );
}
