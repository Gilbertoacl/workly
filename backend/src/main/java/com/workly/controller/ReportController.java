package com.workly.controller;

import com.workly.dto.reports.ContractSummaryDTO;
import com.workly.dto.reports.FinancialReportDTO;
import com.workly.dto.reports.LanguageUsageDTO;
import com.workly.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<List<ContractSummaryDTO>> getContractSummary(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return  ResponseEntity.ok(reportService.getContractSummary(userId));
    }

    @GetMapping("/financial")
    public  ResponseEntity<FinancialReportDTO> getFinancialReports(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(reportService.getFinancialReports(userId));
    }

    @GetMapping("/languages")
    public ResponseEntity<List<LanguageUsageDTO>> getLanguagedUsage(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return ResponseEntity.ok(reportService.getLanguagedUsage(userId));
    }
}
