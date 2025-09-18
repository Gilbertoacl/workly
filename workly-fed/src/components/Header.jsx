import Logo from "../assets/images/Logo.png";
import MenuHamburguer from "./MenuHamburguer";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import SearchBar from "./SearchBar";

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  return (
    <header className="flex justify-between items-center py-4 border border-border shadow-lg">
      <div className="flex justify-around items-center w-1/5">
        <MenuHamburguer onClick={onMenuClick} active={!sidebarCollapsed} />
        <img src={Logo} className="w-56" />
      </div>
      <SearchBar />
      <div className="flex justify-around w-32 items-center">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
