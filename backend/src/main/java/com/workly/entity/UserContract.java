package com.workly.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_contracts")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserContract {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "job_link_hash", length = 64, nullable = false)
    private String jobLinkHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContractStatus status = ContractStatus.PENDING;

    public void setStatus(ContractStatus status) {
        this.status = status;
    }
}
