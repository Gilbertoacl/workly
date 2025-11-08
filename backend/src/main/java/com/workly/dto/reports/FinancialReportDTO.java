package com.workly.dto.reports;

import java.math.BigDecimal;

public record FinancialReportDTO(
        BigDecimal totalMinBudget,
        BigDecimal totalMaxBudget,
        BigDecimal avgBudget
) {
}
