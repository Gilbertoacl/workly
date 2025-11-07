package com.workly.repository;


import com.workly.dto.user.UserContractResponseDTO;
import com.workly.entity.User;
import com.workly.entity.UserContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

public interface UserContractRepository extends JpaRepository<UserContract, Long> {
    boolean existsByUserAndJobLinkHash(User user, String jobLinkHash);
    Optional<UserContract> findByUserAndJobLinkHash(User user, String jobLinkHash);

    @Query(value = """
        SELECT new com.workly.dto.user.UserContractResponseDTO(
            us.status,
            sj.title,
            sj.description,
            sj.linkHash,
            sj.link,
            sj.minBudget,
            sj.maxBudget,
            sj.scraped_at,
            sj.skills,
            sj.source
        )
        FROM UserContract us
        LEFT JOIN ScrapedJob sj ON us.jobLinkHash = sj.linkHash
        WHERE us.user.id = :userId
    """)
    List<UserContractResponseDTO> findJobsByUser(@Param("userId") Long userId);

    @Query("""
        SELECT new com.workly.dto.user.UserContractResponseDTO(
            uc.status,
            sj.title,
            sj.description,
            sj.linkHash,
            sj.link,
            sj.minBudget,
            sj.maxBudget,
            sj.scraped_at,
            sj.skills,
            sj.source
        )
        FROM UserContract uc
        JOIN ScrapedJob sj ON uc.jobLinkHash = sj.linkHash
        WHERE uc.user = :user AND uc.jobLinkHash = :linkHash
    """)
    Optional<UserContractResponseDTO> findContractDTOByUserAndLinkHash(@Param("user") User user, @Param("linkHash") String linkHash);
}
