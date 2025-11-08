package com.workly.repository;

import com.workly.dto.reports.ContractSummaryDTO;
import com.workly.dto.reports.FinancialReportDTO;
import com.workly.entity.UserContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<UserContract, Long> {

    @Query("""
             SELECT new com.workly.dto.reports.ContractSummaryDTO(
                 uc.status,
                 COUNT(uc.id),
                 COALESCE(SUM((sj.minBudget + sj.maxBudget) / 2), 0)
             )
             FROM UserContract uc
             JOIN ScrapedJob sj ON sj.linkHash = uc.jobLinkHash
             WHERE uc.user.id = :userId
             GROUP BY uc.status
       """)
    List<ContractSummaryDTO> findContractSummary(@Param("userId") Long userId);

    @Query("""
        SELECT new com.workly.dto.reports.FinancialReportDTO(
           CAST(SUM(sj.minBudget) AS bigdecimal),
           CAST(SUM(sj.maxBudget) AS bigdecimal),
           CAST(AVG((sj.minBudget + sj.maxBudget) / 2) AS bigdecimal)
        )
        FROM UserContract uc
        JOIN ScrapedJob sj ON sj.linkHash = uc.jobLinkHash
        WHERE uc.user.id = :userId
        AND uc.status = 'COMPLETED'
    """)
    FinancialReportDTO findFinancialReports(@Param("userId") Long userId);

    @Query("""
        SELECT sj.skills
        FROM UserContract uc
        JOIN ScrapedJob sj ON sj.linkHash = uc.jobLinkHash
        WHERE uc.user.id = :userId
    """)
    List<String> findAllSkillsByUser(@Param("userId") Long userId);
}
