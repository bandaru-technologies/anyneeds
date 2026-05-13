package com.anyneeds.user.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SellerPublicDto {
    private Long id;
    private String name;
    private String initials;
    private LocalDateTime joinedAt;
    private long activeListings;
    private long totalListings;
    private boolean verified;
    private long followersCount;
    private boolean following;
}
