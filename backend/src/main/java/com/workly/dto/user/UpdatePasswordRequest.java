package com.workly.dto.user;

public record UpdatePasswordRequest(String currentPassword, String newPassword) {
}
