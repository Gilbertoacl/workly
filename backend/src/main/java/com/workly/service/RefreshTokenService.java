package com.workly.service;

import com.workly.entity.RefreshToken;
import com.workly.repository.RefreshTokenRepository;
import com.workly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshToken creationRefreshToken(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(generateExpirationData())
                .created_at(Instant.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Token Expirado. Por favor entre novamente.");
        }
        return token;
    }

    private Instant generateExpirationData() {
        return LocalDateTime.now().plusDays(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
