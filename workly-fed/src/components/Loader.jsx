
export default function Loader() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
      <path className="opacity-90" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}