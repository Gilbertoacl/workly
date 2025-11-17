import MenuHamburguer from "./MenuHamburguer";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { Link } from "react-router-dom";

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  return (
    <header className="flex justify-between items-center px-5 py-2 
      bg-surface/80 border-b border-border shadow-md">
      
      <MenuHamburguer onClick={onMenuClick} active={sidebarCollapsed} />

      <Link to="/home" className="font-JuaRegular text-3xl tracking-wide text-primary hover:opacity-80 transition">
        Workly
      </Link>

      <div className="flex gap-3 items-center">
        {/* Futuro NotificationDropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
};


export default Header;
