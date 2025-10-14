package com.workly.dto.scrapedjob;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobResponseDTO(
        String source,
        String title,
        String link,
        String linkHash,
        String description,
        String skills,
        BigDecimal minBudget,
        BigDecimal maxBudget,
        LocalDateTime scraped_at
)
{}
