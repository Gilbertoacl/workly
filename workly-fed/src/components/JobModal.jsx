import { useState, useEffect } from "react";
import LogoWorkana from "../assets/images/workana_icone.jpg";
import { FaStar, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

export default function JobModal({ job, onClose }) {
  const [isFavorited, setIsFavorited] = useState(false);

  const badgeColors = [
    "bg-blue-200 text-blue-800",
    "bg-green-200 text-green-800",
    "bg-yellow-200 text-yellow-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
    "bg-red-200 text-red-800",
    "bg-indigo-200 text-indigo-800",
    "bg-teal-200 text-teal-800",
    "bg-orange-200 text-orange-800",
  ];

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

  const handleAddContract = () => {
    setAdded(true);

    setTimeout(() => setAdded(false), 1500);
  };

  const [added, setAdded] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full relative modal-scroll"
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#a3a3a3 #f3f4f6",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
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
          <h2 className="text-xl font-bold">{job.title}</h2>
        </div>
        <div className="mb-2 text-sm text-gray-500">{job.description}</div>
        <div className="mb-4">
          <span className="font-semibold">Orçamento:</span> R$ {job.minBudget} ~{" "}
          {job.maxBudget}
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {job.skills &&
            job.skills.split(" | ").map((skill, index) =>
              skill === "+" ? null : (
                <span
                  key={index}
                  className={`rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${
                    badgeColors[index % badgeColors.length]
                  }`}
                >
                  {skill}
                </span>
              )
            )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition font-semibold"
          >
            Ver vaga
          </a>
          <button
            onClick={handleAddContract}
            disabled={added}
            className={`bg-green-600 text-white px-5 py-2 rounded-full transition font-semibold flex items-center justify-center ${
              added ? "bg-green-700" : "hover:bg-green-700"
            }`}
          >
            {added ? (
              <>
                <FaCheck className="mr-2" />
                Adicionado!
              </>
            ) : (
              "Adicionar aos contratos"
            )}
          </button>
          <button
            onClick={handleFavorite}
            className="p-2 rounded-full transition flex items-center justify-center"
            aria-label={isFavorited ? "Desfavoritar" : "Favoritar"}
            style={{ background: "none", border: "none" }}
          >
            <motion.span
              animate={
                isFavorited
                  ? {
                      rotate: [0, 360],
                      scale: [1, 0.6, 1.2, 1],
                      color: "#facc15",
                    }
                  : {
                      rotate: [360, 0],
                      scale: [1, 1.2, 0.6, 1],
                      color: "#a3a3a3",
                    }
              }
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              style={{ display: "inline-block" }}
            >
              <FaStar size={32} />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}
