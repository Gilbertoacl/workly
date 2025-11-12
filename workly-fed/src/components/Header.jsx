import Logo from "../assets/images/Logo.png";
import MenuHamburguer from "./MenuHamburguer";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  return (
    <header className="flex justify-between items-center py-4 border border-border shadow-lg">
      <div className="flex items-center gap-4 ml-4">
        <MenuHamburguer onClick={onMenuClick} active={!sidebarCollapsed} />
        <Link to="/home" className="font-JuaRegular text-4xl">Workly</Link>
      </div>
      {/* <SearchBar /> */}
      <div className="flex justify-around w-32 items-center">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
