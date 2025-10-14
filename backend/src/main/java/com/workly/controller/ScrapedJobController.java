package com.workly.controller;

import com.workly.dto.scrapedjob.JobResponseDTO;
import com.workly.service.ScrapedJobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api")
public class ScrapedJobController {

    private final ScrapedJobService service;

    public ScrapedJobController(ScrapedJobService service) {
        this.service = service;
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobResponseDTO>> listJobs(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(service.findAllJobs(pageable));
    }
}
