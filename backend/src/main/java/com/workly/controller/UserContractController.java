package com.workly.controller;

import com.workly.dto.user.UserContractRequestDTO;
import com.workly.dto.user.UserContractResponseDTO;
import com.workly.dto.user.UserContractUpdateRequestDTO;
import com.workly.service.UserContractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
public class UserContractController {
    private final UserContractService service;

    public UserContractController(UserContractService service) {
        this.service = service;
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<UserContractResponseDTO>> getUserContracts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<UserContractResponseDTO> contracts = service.listUserContracts(email);

        if (contracts.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(contracts);
    }

    @PostMapping("/contracts")
    public ResponseEntity<Void> addUserContract(@RequestBody @Valid UserContractRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        service.addContract(email, request.linkHash());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/contracts")
    public ResponseEntity<Void> updateUserContractStatus(@RequestBody @Valid UserContractUpdateRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        service.updateContractStatus(email, request.linkHash(), request.newStatus());
        return ResponseEntity.noContent().build();
    }
}