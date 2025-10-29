package com.workly.repository;


import com.workly.dto.UserContractResponseDTO;
import com.workly.entity.ScrapedJob;
import com.workly.entity.User;
import com.workly.entity.UserContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

public interface UserContractRepository extends JpaRepository<UserContract, Long> {
    List<UserContract> findByUser(UserDetails user);
    boolean existsByUserAndJobLinkHash(User user, String jobLinkHash);
    Optional<UserContract> findByUserAndJobLinkHash(User user, String jobLinkHash);

    @Query(value = """
        SELECT new com.workly.dto.UserContractResponseDTO(
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
}
