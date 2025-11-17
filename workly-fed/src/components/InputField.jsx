
export default function InputField({ label, type, value, error, onChange, icon, onIconClick }) {
  return (
    <div className="space-y-1">
      <label className="text-white text-sm">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#1B222C] text-white border rounded-md py-3 px-3 focus:outline-none focus:ring-2 focus:ring-[#00D26A] transition ${error ? "border-[#FF4E4E]" : "border-transparent"}`}
        />
        {icon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            onClick={onIconClick}
          >
            {icon}
          </button>
        )}
      </div>
      {error && <p className="text-[#FF4E4E] text-xs">{error}</p>}
    </div>
  );
}

