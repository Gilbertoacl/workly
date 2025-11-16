package com.workly.controller;

import com.workly.dto.user.UpdatePasswordRequest;
import com.workly.dto.user.UpdateProfileRequest;
import com.workly.dto.user.UserDTO;
import com.workly.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PatchMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@AuthenticationPrincipal(expression = "id") Long userId,
                                                 @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(service.updateProfile(userId, request));
    }

    @PatchMapping("/password")
    public ResponseEntity<UserDTO> updatePassword(@AuthenticationPrincipal(expression = "id") Long userId,
                                                 @RequestBody UpdatePasswordRequest request) {
        return ResponseEntity.ok(service.updatePassword(userId, request));
    }

    public ResponseEntity<UserDTO> getUser(@AuthenticationPrincipal(expression = "id") Long userId) {
        return ResponseEntity.ok(service.getUser(userId));
    }
}
