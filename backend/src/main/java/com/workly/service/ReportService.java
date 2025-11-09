package com.workly.service;

import com.workly.dto.reports.ContractSummaryDTO;
import com.workly.dto.reports.FinancialReportDTO;
import com.workly.dto.reports.LanguageUsageDTO;
import com.workly.repository.ReportRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReportService {
    private final ReportRepository repository;

    @Transactional(readOnly = true)
    public List<ContractSummaryDTO> getContractSummary(Long userId) {
        return repository.findContractSummary(userId);
    }

    @Transactional(readOnly = true)
    public FinancialReportDTO getFinancialReports(Long userId) {
        return repository.findFinancialReports(userId);
    }

    @Transactional(readOnly = true)
    public List<LanguageUsageDTO> getLanguagedUsage(Long userId) {
        List<String> skills = repository.findAllSkillsByUser(userId);

        Map<String, Long> skillCount = skills.stream()
                .filter(Objects::nonNull)
                .flatMap(s -> Arrays.stream(s.split("\\s*\\|\\s*")))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.equals("+"))
                .collect(Collectors.groupingBy(s-> s, Collectors.counting()));

        return skillCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new LanguageUsageDTO(e.getKey(), e.getValue()))
                .toList();
    }
}
