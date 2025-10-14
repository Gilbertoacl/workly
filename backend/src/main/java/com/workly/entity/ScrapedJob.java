package com.workly.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "scraped_jobs")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ScrapedJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String link;

    @Column(nullable = false, length = 64, unique = true)
    private String linkHash;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(length = 100)
    private String originalBudget;

    @Column(precision = 10, scale = 2)
    private BigDecimal minBudget;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxBudget;

    private Integer proposals;

    @Column(length = 50)
    private String conversionMethod;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime scraped_at;
}
