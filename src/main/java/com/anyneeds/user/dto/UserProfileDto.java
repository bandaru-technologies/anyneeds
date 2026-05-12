package com.anyneeds.user.dto;

import com.anyneeds.user.entity.User;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileDto {
    private Long id;
    private String phoneNumber;
    private String name;
    private String email;
    private String profileImageUrl;

    public static UserProfileDto from(User user) {
        return UserProfileDto.builder()
            .id(user.getId())
            .phoneNumber(user.getPhoneNumber())
            .name(user.getName())
            .email(user.getEmail())
            .profileImageUrl(user.getProfileImageUrl())
            .build();
    }
}
