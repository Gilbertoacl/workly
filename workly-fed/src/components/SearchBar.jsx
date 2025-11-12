import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("Skills");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(keyword, type)
  }

    const options = [
      { value: "Skills", label: "Linguagem ex: JavaScript, Java, Python..." },
      { value: "Title", label: "Título ex: Desenvolvedor Frontend, Engenheiro de Software..."},
    ];

  return (
    <form onSubmit={handleSubmit} className="px-4 w-full max-w-[800px]">
      <label htmlFor="default-search" className="sr-only">
        Search
      </label>

      <div className="relative">
        {/* Ícone dentro do input */}
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-5 h-5 text-textSecondary"
          >
            <path
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          id="default-search"
          type="search"
          required
          placeholder={`Pesquisar por ${options
            .find((opt) => opt.value === type)
            .label.toLowerCase()}`}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="
            block w-full rounded-full border border-border bg-surface
            ps-10 pe-24 py-3 text-base text-textPrimary placeholder-textSecondary
            focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition
          "
        />

        {/* Botão de busca */}
        <button
          type="submit"
          className="
            absolute end-2.5 bottom-1/2 translate-y-1/2
            flex items-center justify-center
            px-4 py-2 
            rounded-r-full
            bg-primary text-primary-text font-medium
            hover:bg-primary-hover transition
            focus:ring-2 focus:ring-primary/50 focus:outline-none
          "
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-4 h-4"
          >
            <path
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
            />
          </svg>
          <span className="sr-only">Pesquisar</span>
        </button>

        {/* Select de tipos */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="
            absolute end-16 bottom-1/2 translate-y-1/2
            flex items-center justify-center
            px-1.5 py-1 rounded-l-full
            bg-primary text-primary-text font-medium
            hover:bg-primary-hover transition
            focus:ring-2 focus:ring-primary/50 
          "
        >
          <option value="Skills">Linguagem</option>
          <option value="Title">Título</option>
        </select>
      </div>
    </form>
  );
}
