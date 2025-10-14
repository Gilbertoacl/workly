package com.workly.repository;

import com.workly.entity.ScrapedJob;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScrapedJobRepository extends JpaRepository<ScrapedJob, Long> {
}
