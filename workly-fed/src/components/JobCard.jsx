import { useState } from "react";
import LogoWorkana from "../assets/images/workana_icone.jpg";
import SkillBadge from "./SkillBadge";
import { formatBudget, formatDate } from "@/common/utils/UtilsGlobal";

export default function JobCard({ job, onClick, isSelected }) {
  const MAX_LENGTH = 300;
  const truncateText = (t) => (t?.length > MAX_LENGTH ? t.slice(0, MAX_LENGTH) + "..." : t);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer w-full max-w-md rounded-xl border transition-all duration-200 p-5 bg-[#14191C] hover:border-[#2A9D8F] hover:shadow-lg
      ${isSelected ? "border-[#2A9D8F]" : "border-[#22282C]"}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0">
          <img src={LogoWorkana} alt="Workana" className="w-10 h-10 object-contain" />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-200 leading-tight">{job.title}</h3>

          <div className="text-xs text-gray-400 mt-1 flex justify-between">
            <span>{formatDate(job.scraped_at)}</span>
            <span>R$ {formatBudget(job.minBudget)} - {formatBudget(job.maxBudget)}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-300 leading-snug">
        {truncateText(job.description)}
      </p>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <SkillBadge skills={job.skills} />
      </div>
    </div>
  );
}
