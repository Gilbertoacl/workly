import { useEffect, useState } from "react";
import api from "../lib/api";
import JobCard from "./JobCard";
import { FaArrowLeft, FaArrowRight, FaRegSadTear } from "react-icons/fa";
import JobCardSkeleton from "./JobCardSkeleton";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    setLoading(true);
    api
      .get(`/api/jobs?page=${page}`)
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

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {[...Array(6)].map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!jobs.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <FaRegSadTear size={48} className="mb-4" />
        <span className="text-lg font-semibold">
          Nenhum freela foi encontrado.
        </span>
        <span className="text-sm mt-2">
          Tente ajustar os filtros ou volte mais tarde.
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 transition-opacity duration-200 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {jobs.map((job) => (
          <JobCard key={job.linkHash} job={job} />
        ))}
      </div>
      <div className="flex justify-center gap-2 mb-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="content-center px-3 py-1 hover:-translate-x-1 disabled:opacity-50 disabled:translate-x-0"
        >
          <FaArrowLeft />
        </button>
        <span className="text-base px-3 py-1">
          {page + 1} de {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="content-center px-3 py-1 hover:translate-x-1 disabled:opacity-50 disabled:translate-x-0"
        >
          <FaArrowRight />
        </button>
      </div>
    </>
  );
}
