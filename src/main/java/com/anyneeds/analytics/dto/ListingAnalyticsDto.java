package com.anyneeds.analytics.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingAnalyticsDto {
    private Long listingId;
    private String title;
    private BigDecimal price;
    private String city;
    private String status;
    private String thumbnail;
    private long views;
    private long saves;
    private long chats;
    private boolean boosted;
    private LocalDateTime boostedUntil;
    private LocalDateTime createdAt;
}
