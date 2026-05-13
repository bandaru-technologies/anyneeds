package com.anyneeds.analytics.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsDashboardDto {
    private long totalViews;
    private long totalSaves;
    private long totalChats;
    private int activeListings;
    private List<ListingAnalyticsDto> listings;
}
