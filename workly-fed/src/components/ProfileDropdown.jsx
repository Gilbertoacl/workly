import { useEffect, useRef, useState } from "react";

const ProfileDropdown = () => {
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

  const menus = ["Editar meu perfil", "Configurações", "Ajuda", "Sair"];

  return (
    <div className="relative" ref={dropdownRef}>
        <span onClick={toggleDropdown} className="mx-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-text dark:bg-primary cursor-pointer">GA</span>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-primary border border-border rounded-md shadow-lg z-10">
            {menus.map((element, index) => (
                <h3 key={index} className={`
                text-center font py-2 text-lg cursor-pointer 
                ${index < menus.length - 1 ? 'border-b hover:border-b-2' : ''}
                hover:font-semibold
              `}>{element}</h3>
            ))}
        </div>
      )}
    </div>
  );
};
export default ProfileDropdown;
