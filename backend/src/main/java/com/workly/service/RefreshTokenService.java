package com.workly.service;

import com.workly.entity.RefreshToken;
import com.workly.repository.RefreshTokenRepository;
import com.workly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${security.jwt.refresh-expiration-days:2}")
    private long refreshExpirationDays;

    public RefreshToken createRefreshToken(Long userId) {

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        //refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(generateExpirationDate())
                .created_at(Instant.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validateExpiration(RefreshToken token) {

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh Token expirado, faça login novamente.");
        }

        return token;
    }

    private Instant generateExpirationDate() {
        return LocalDateTime.now()
                .plusDays(refreshExpirationDays)
                .toInstant(ZoneOffset.of("-03:00"));
    }
}

