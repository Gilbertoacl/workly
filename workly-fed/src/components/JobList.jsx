import { useEffect, useState } from "react";
import api from "../lib/api";
import JobCard from "./JobCard";

export default function JobList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {        
        api.get('/api/jobs')
            .then(response => {
                setJobs(response.data.content);
            })
            .catch(() => {
                setJobs([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Carregando...</div>;
    if (!jobs.length) return <div>Nenhum job encontrado.</div>;

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
            {jobs.map(job => <JobCard key={job.linkHash} job={job} />)}
        </div>
    )
}