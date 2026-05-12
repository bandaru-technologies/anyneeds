package com.anyneeds.auth.dto;

import com.anyneeds.user.dto.UserProfileDto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private UserProfileDto user;
}
