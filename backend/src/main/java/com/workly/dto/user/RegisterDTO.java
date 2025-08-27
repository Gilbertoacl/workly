package com.workly.dto.user;

import com.workly.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterDTO(
        @NotBlank(message = "{nome.obrigatorio}")
        String name,
        @NotBlank(message = "{email.obrigatorio}")
        @Email(message = "{email.invalido}")
        String email,
        @NotBlank(message = "{password.obrigatorio}")
        String password,
        @NotNull(message = "{role.obrigatorio}")
        UserRole role
) {
}
