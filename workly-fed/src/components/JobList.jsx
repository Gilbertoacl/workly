import { useEffect, useState } from "react";
import api from "../lib/api";
import JobCard from "./JobCard";
import { FaArrowLeft, FaArrowRight, FaRegSadTear } from "react-icons/fa";
import JobCardSkeleton from "./JobCardSkeleton";
import JobModal from "./JobModal";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fade, setFade] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    setFade(false);
    setLoading(true);

    api.get(`/api/jobs?page=${page}`)
      .then((response) => {
        setTimeout(() => {
          setJobs(response.data.content);
          setTotalPages(response.data.page.totalPages);
          setFade(true);
          setLoading(false);
        }, 200);
      })
      .catch(() => {
        setJobs([]);
        setFade(true);
        setLoading(false);
      });
  }, [page]);

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FaRegSadTear size={48} className="mb-4 opacity-70" />
          <span className="text-lg font-medium">Nenhum freela encontrado</span>
          <span className="text-xs opacity-70 mt-1">
            Ajuste filtros ou tente novamente mais tarde
          </span>
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.linkHash}
                job={job}
                onClick={() => setSelectedJob(job)}
                isSelected={selectedJob?.linkHash === job.linkHash}
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded-md border border-gray-600 hover:border-gray-400 hover:bg-gray-800 disabled:opacity-40 transition-all"
            >
              <FaArrowLeft />
            </button>
            <span className="font-medium text-gray-300 text-sm px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-md border border-gray-600 hover:border-gray-400 hover:bg-gray-800 disabled:opacity-40 transition-all"
            >
              <FaArrowRight />
            </button>
          </div>

          {selectedJob && (
            <JobModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
            />
          )}
        </>
      )}
    </>
  );
}
