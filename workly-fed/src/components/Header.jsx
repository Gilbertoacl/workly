import MenuHamburguer from "./MenuHamburguer";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { Link } from "react-router-dom";

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  return (
    <header className="flex justify-between items-center px-4 py-1 border border-border shadow-lg">
      <MenuHamburguer onClick={onMenuClick} active={!sidebarCollapsed} />
      <Link to="/home" className="font-JuaRegular text-4xl">
        Workly
      </Link>
      <div className="flex justify-around w-32 items-center">
        {/* <NotificationDropdown /> */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
