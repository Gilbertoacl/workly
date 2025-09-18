import { useState, useEffect, useRef } from "react";
import { FaRegBell } from "react-icons/fa";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative cursor-pointer" onClick={toggleDropdown}>
        <span className="text-2xl">
          <FaRegBell />
        </span>
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-white text-border text-xs font-bold rounded-full">
          1
        </span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-primary border border-border rounded-md shadow-lg z-10 ">
          <h3 className="font-bold text-lg border-b-2 p-2">NOVIDADES</h3>
          {/* Conteúdo das notificações */}
          <div className="flex items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-surface">
            <div className="mr-3 text-2xl">🏆</div>
            <div>
              <span className="text-sm text-textPrimary font-semibold">
                CURSO
              </span>
              <p className="font-semibold text-textPrimary">
                Business Partner: Estratégias Data Driven para RH
              </p>
              <p className="text-xs text-gray-400">1 dia atrás</p>
            </div>
          </div>
          {/* Adicione outros itens aqui */}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
