package com.workly.dto.user;

import com.workly.entity.ContractStatus;

public record UserContractUpdateRequestDTO(
        String linkHash,
        ContractStatus newStatus
) {
}
