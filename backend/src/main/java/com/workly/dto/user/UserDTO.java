package com.workly.dto.user;

import com.workly.entity.User;
import com.workly.entity.UserRole;

public record UserDTO (String name, String email, UserRole role){
    public static UserDTO fromEntity(User user) {
        return new UserDTO(user.getName(), user.getEmail(), user.getRole());
    }
}
