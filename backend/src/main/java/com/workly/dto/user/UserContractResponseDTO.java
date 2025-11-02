package com.workly.dto.user;

import com.workly.entity.ContractStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserContractResponseDTO(
        ContractStatus status,
        String title,
        String description,
        String link_hash,
        String link,
        BigDecimal min_budget,
        BigDecimal max_budget,
        LocalDateTime scraped_at,
        String skills,
        String source
        )
{}
