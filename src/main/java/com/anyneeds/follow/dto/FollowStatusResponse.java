package com.anyneeds.follow.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FollowStatusResponse {
    private boolean following;
    private long followersCount;
}
