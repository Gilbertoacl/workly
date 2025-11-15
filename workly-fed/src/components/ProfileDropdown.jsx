import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { FaInfoCircle, FaRegUser } from "react-icons/fa";
import { FaArrowRightFromBracket, FaGear } from "react-icons/fa6";
import { Link } from "react-router-dom";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

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

  const navItems = [
    {
      icon: <FaRegUser />,
      label: "Editar meu perfil",
      path: "/profile",
      method: "",
    },
    {
      icon: <FaGear />,
      label: "Configurações",
      path: "/home/settings",
      method: "",
    },
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
    <div className="relative" ref={dropdownRef}>
      <span
        onClick={toggleDropdown}
        className="mx-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-text dark:bg-primary cursor-pointer"
      >
        GA
      </span>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-primary border border-border rounded-md shadow-lg z-10">
          {navItems.map((element, index) => (
            <Link
              key={element.label}
              to={element.path}
              onClick={element.method}
              className={`flex items-center justify-start py-2 gap-2 ml-2 text-lg cursor-pointer ${
                index < navItems.length - 1 ? "border-b hover:border-b-2" : ""
              }
                hover:font-semibold
              `}
            >
              <span>{element.icon}</span>
              {element.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProfileDropdown;
