import { useState } from "react";
import LogoWorkana from "../assets/images/workana_icone.jpg";
import SkillBadge from "./SkillBadge";
import { formatBudget, formatDate } from "@/common/utils/UtilsGlobal";

export default function JobCard({ job, onClick, isSelected }) {
  const MAX_LENGTH = 300;

  const truncateText = (text, maxLength = 300) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mx-auto my-2
        border-2 transition-all duration-200
        ${isSelected ? "border-blue-500 shadow-lg" : "border-transparent hover:border-blue-500"}`}
    >
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
          {truncateText(job.description, MAX_LENGTH)}
        </div>
      </div>
      <div className="flex justify-between items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <SkillBadge skills={job.skills} />
        </div>
      </div>
    </div>
  );
}
