import { useState } from "react";
import api from "@/lib/api";
import JobCard from "@/components/JobCard";
import JobModal from "@/components/JobModal";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import { FaRegSadTear } from "react-icons/fa";
import SearchBar from "@/components/SearchBar";

export default function JobsSearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(keyword, type) {
    setResults([]);
    if (!keyword.trim()) return;
    setLoading(true);
    setHasSearched(true);

    api
      .post(`/api/jobs/search`, { keyword, type })
      .then((response) => {
        setTimeout(() => {
          setResults(response.data);
          setLoading(false);
        }, 200);
      })
      .catch((error) => {
        setResults([]);
        setLoading(false);
        console.error("Erro ao buscar vagas:", error);
      });
  }

  return (
    <div className="p-6 w-full mx-auto">
      <div className="flex justify-center gap-2 mb-6">       
        <SearchBar onSearch={handleSearch}/>        
      </div>

      {loading && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && hasSearched && results.length === 0  && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <FaRegSadTear size={48} className="mb-4" />
          <span className="text-lg font-semibold">
            Nenhum freela foi encontrado.
          </span>
          <span className="text-sm mt-2">
            Tente ajustar os filtros ou volte mais tarde.
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {results.map((job) => (
          <JobCard
            key={job.linkHash}
            job={job}
            onClick={() => setSelectedJob(job)}
            isSelected={selectedJob?.linkHash === job.linkHash}
          />
        ))}
        {selectedJob && (
          <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </div>
    </div>
  );
}
