import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { FaInfoCircle, FaRegUser } from "react-icons/fa";
import { FaArrowRightFromBracket, FaGear } from "react-icons/fa6";
import { Link } from "react-router-dom";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
 

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getInitials = (nome= "") => {
    const ignoredWords = ["da","das","de","do","dos","di","du","von","van"];
    const filtered = nome.trim().toLowerCase().split(/\s+/).filter(word => word && !ignoredWords.includes(word))

    if (!filtered.length) return "";

    const first = filtered[0][0];
    const last = filtered.length > 1 ? filtered.at(1)[0] : "";

    return (first + last).toUpperCase();
  }

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

  const navItems = [
    {
      icon: <FaRegUser />,
      label: "Editar meu perfil",
      path: "/home/profile",
      method: "",
    },
    // {
    //   icon: <FaGear />,
    //   label: "Configurações",
    //   path: "/home/settings",
    //   method: "",
    // },
    { icon: <FaInfoCircle />, 
      label: "Ajuda", 
      path: "/home/help", 
      method: "" },
    {
      icon: <FaArrowRightFromBracket />,
      label: "Sair",
      path: "/",
      method: logout,
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 rounded-full bg-primary 
        text-background font-semibold items-center justify-center shadow-sm 
        hover:bg-primary/30 transition"
      >
        {getInitials(user.nomeUsuario)}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-surface border border-border 
          rounded-lg shadow-xl overflow-hidden animate-fadeIn z-50">
          
          {navItems.map((item, index) => (
            <Link key={item.label} to={item.path} onClick={item.method}
              className={`flex items-center gap-3 px-4 py-3 text-text-primary
              hover:bg-primary/15 hover:text-primary transition
              ${index < navItems.length - 1 ? "border-b border-border" : ""}`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProfileDropdown;
