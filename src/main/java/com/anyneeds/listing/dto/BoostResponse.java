package com.anyneeds.listing.dto;

import com.anyneeds.listing.entity.ListingBoost;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoostResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private String plan;
    private BigDecimal amountPaid;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    public static BoostResponse from(ListingBoost b) {
        return BoostResponse.builder()
            .id(b.getId())
            .listingId(b.getListing().getId())
            .listingTitle(b.getListing().getTitle())
            .plan(b.getPlan().name())
            .amountPaid(b.getAmountPaid())
            .startedAt(b.getStartedAt())
            .expiresAt(b.getExpiresAt())
            .build();
    }
}
