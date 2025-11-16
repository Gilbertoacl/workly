package com.workly.service;

import com.workly.dto.user.UpdatePasswordRequest;
import com.workly.dto.user.UpdateProfileRequest;
import com.workly.dto.user.UserDTO;
import com.workly.entity.User;
import com.workly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final MessageSource messageSource;

    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user =repository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(
                        messageSource.getMessage("user.notfound", null, Locale.getDefault())
                ));

       if (repository.existsByEmail(request.email()) && !request.email().equals(user.getEmail())) {
            throw new IllegalArgumentException(
                    messageSource.getMessage("user.email.invalid", null, Locale.getDefault())
            );
       }

       user.setName(request.name());
       user.setEmail(request.email());

       return UserDTO.fromEntity(repository.save(user));
    }

    public UserDTO updatePassword(Long userId, UpdatePasswordRequest request) {
        User user =repository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(
                        messageSource.getMessage("user.notfound", null, Locale.getDefault())
                ));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException(
                    messageSource.getMessage("user.password.invalid", null, Locale.getDefault())
            );
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));

        return UserDTO.fromEntity(repository.save(user));
    }

    public UserDTO getUser(Long userId) {
        return UserDTO.fromEntity(
                repository.findById(userId)
                        .orElseThrow(() -> new UsernameNotFoundException(
                                messageSource.getMessage(
                                        "user.notfound",
                                        null,
                                        Locale.getDefault()))
                        )
        );
    }
}
