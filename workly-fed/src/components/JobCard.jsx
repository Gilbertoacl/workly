import { useState } from "react";
import LogoWorkana from "../assets/images/workana_icone.jpg";

export default function JobCard({ job }) {
  const skills = job.skills ? job.skills.split(" | ") : [];
  const [expanded, setExpanded] = useState(false);
  const maxLength = 300;

  const handleExpand = () => setExpanded(true);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatBudget = (value) => {
    if (value == null) return "";
    const rounded = Math.round(value);
    return rounded.toLocaleString("pt-BR");
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mx-auto my-2">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex flex-row items-center space-x-4 w-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-white">
            {job.source === "workana" ? (
              <img
                src={LogoWorkana}
                className="object-contain w-10 h-10"
                alt="Logo Workana"
              />
            ) : (
              <svg
                className="w-12 h-12"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="#ccc" />
              </svg>
            )}
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold dark:text-white break-words">
              {job.title}
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-200 flex-wrap">
              <div>{formatDate(job.scraped_at)}</div>
              <div>
                R$ {formatBudget(job.minBudget)} ~ {formatBudget(job.maxBudget)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-1">
        <div className="text-sm text-gray-800 dark:text-gray-200">
          {expanded
            ? job.description
            : truncateText(job.description, maxLength)}
          {!expanded &&
            job.description &&
            job.description.length > maxLength && (
              <button
                onClick={handleExpand}
                className="text-blue-500 hover:underline ml-2"
                aria-label="Expandir descrição completa"
              >
                ...ver mais
              </button>
            )}
          {expanded &&
            job.description &&
            job.description.length > maxLength && (
              <button
                onClick={() => setExpanded(false)}
                className="text-blue-500 hover:underline ml-2"
                aria-label="Recolher descrição"
              >
                ...ver menos
              </button>
            )}
        </div>
      </div>
      <div className="flex justify-between items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-wrap gap-2 items-center">
            {skills.map((skill, index) =>
              skill === "+" ? null : (
                <span
                  key={index}
                  className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
