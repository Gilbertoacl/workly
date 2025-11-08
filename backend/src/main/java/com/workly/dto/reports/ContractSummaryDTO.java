package com.workly.dto.reports;

import com.workly.entity.ContractStatus;

import java.math.BigDecimal;

public record ContractSummaryDTO(
        ContractStatus status,
        Long totalContracts,
        BigDecimal totalBudget
) {
}
