package com.workly.service;

import com.workly.dto.scrapedjob.JobResponseDTO;
import com.workly.repository.ScrapedJobRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ScrapedJobService {
    private final ScrapedJobRepository repository;

    public ScrapedJobService(ScrapedJobRepository repository) {
        this.repository = repository;
    }

    public Page<JobResponseDTO> findAllJobs(Pageable pageable) {
        return repository.findAll(pageable)
                .map(job -> new JobResponseDTO(
                        job.getSource(),
                        job.getTitle(),
                        job.getLink(),
                        job.getLinkHash(),
                        job.getDescription(),
                        job.getSkills(),
                        job.getMinBudget(),
                        job.getMaxBudget(),
                        job.getScraped_at()
                ));
    }
}
