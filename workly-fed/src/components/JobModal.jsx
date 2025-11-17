import { useState, useEffect } from "react";
import LogoWorkana from "../assets/images/workana_icone.jpg";
import { FaStar, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import SkillBadge from "./SkillBadge";
import api from "@/lib/api";

export default function JobModal({ job, onClose }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favoriteJobs") || "[]");
    setIsFavorited(favorites.includes(job.linkHash));
  }, [job.linkHash]);

  const handleFavorite = () => {
    setIsFavorited((fav) => {
      const newFav = !fav;
      let favorites = JSON.parse(localStorage.getItem("favoriteJobs") || "[]");
      if (newFav) {
        favorites.push(job.linkHash);
      } else {
        favorites = favorites.filter((id) => id !== job.linkHash);
      }
      localStorage.setItem("favoriteJobs", JSON.stringify(favorites));
      return newFav;
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleAddContract = async (linkHash) => {   
    console.log(linkHash) 
    try{
      await api.post("/api/users/contracts", { linkHash });
      setAdded(true);
    } catch (error) {
      console.log(error)
      alert("Contrato ja adicionado a sua lista.")
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="rounded-xl p-6 max-w-3xl w-full relative modal-scroll border bg-[#14191C] border-[#1F2A35] shadow-xl"
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#4B5563 #1F2A35",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-[#9CA3AF] hover:text-white text-2xl font-bold transition"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-white mr-4">
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
          <h2 className="text-xl font-bold text-white leading-6">{job.title}</h2>
        </div>

        {/* Description */}
        <div className="mb-3 text-sm text-[#9CA3AF] leading-relaxed">
          {job.description}
        </div>

        {/* Salary */}
        <div className="mb-4 text-[#FFFFFF] font-medium">
          <span className="font-semibold text-[#00B085]">Orçamento:</span>  
          {" "}R$ {job.minBudget} ~ {job.maxBudget}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-5 items-center">
          <SkillBadge skills={job.skills} />
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 flex-wrap">
          
          {/* External Link */}
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#0070F3] hover:bg-[#0A84FF] text-white px-5 py-2 rounded-lg transition font-semibold text-center"
          >
            Ver vaga
          </a>

          {/* Add Contract */}
          <button
            onClick={() => handleAddContract(job.linkHash)}
            disabled={added}
            className={`flex-1 px-5 py-2 rounded-lg text-white font-semibold transition 
              ${added ? "bg-[#00936E]/60 cursor-not-allowed" : "bg-[#00936E] hover:bg-[#00B085]"}`}
          >
            {added ? (
              <span className="flex items-center justify-center gap-2">
                <FaCheck /> Adicionado!
              </span>
            ) : (
              "Adicionar aos contratos"
            )}
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="p-2 rounded-full transition flex items-center justify-center"
            aria-label={isFavorited ? "Desfavoritar" : "Favoritar"}
          >
            <motion.span
              animate={
                isFavorited
                  ? { scale: [1, 1.3, 1], color: "#EAC54F" }
                  : { scale: [1, 1.1, 1], color: "#6B7280" }
              }
              transition={{ duration: 0.3 }}
              style={{ display: "inline-block" }}
            >
              <FaStar size={28} />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
