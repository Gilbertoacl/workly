

const MenuHamburguer = ({ onClick, active }) => {
  // active = true significa sidebar colapsada
  return (
    <button
      className="flex flex-col gap-2 w-8 focus:outline-none"
      onClick={onClick}
      aria-label="Alternar menu lateral"
      type="button"
    >
      <div className={`rounded-2xl h-[3px] w-1/2 bg-textPrimary duration-500 ${active ? "rotate-[225deg] origin-right -translate-x-[12px] -translate-y-[1px]" : ""}`} />
      <div className={`rounded-2xl h-[3px] w-full bg-textPrimary duration-500 ${active ? "-rotate-45" : ""}`} />
      <div className={`rounded-2xl h-[3px] w-1/2 bg-textPrimary duration-500 place-self-end ${active ? "rotate-[225deg] origin-left translate-x-[12px] translate-y-[1px]" : ""}`} />
    </button>
  );
};

export default MenuHamburguer;
