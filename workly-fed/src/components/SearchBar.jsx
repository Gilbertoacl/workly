import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("Skills");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(keyword, type);
  }

  const options = [
    { value: "Skills", label: "Linguagem" },
    {
      value: "Title",
      label: "Título",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[800px] mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Tipo da busca */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="
        w-full sm:w-40 px-4 py-3 rounded-xl border border-border bg-surface
        text-textPrimary text-sm font-medium shadow-sm
        focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition
        cursor-pointer
      "
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Campo de busca */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-textSecondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <input
            type="search"
            required
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={`Pesquisar por ${options
              .find((o) => o.value === type)
              .label.toLowerCase()}`}
            className="
          w-full ps-11 pe-4 py-3 rounded-xl border border-border bg-surface
          text-textPrimary placeholder-textSecondary text-base
          focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition
          shadow-sm
        "
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="
        w-full sm:w-auto px-6 py-3 rounded-xl font-semibold
        bg-primary text-white hover:bg-primary-hover
        transition shadow-sm shadow-black/10
      "
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
