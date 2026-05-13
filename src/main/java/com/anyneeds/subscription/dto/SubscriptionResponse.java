package com.anyneeds.subscription.dto;

import com.anyneeds.subscription.entity.UserSubscription;
import com.anyneeds.subscription.entity.UserSubscription.SubscriptionTier;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubscriptionResponse {
    private Long userId;
    private String tier;
    private boolean active;
    private boolean verified;
    private int listingLimit;
    private int boostCredits;
    private int monthlyPrice;
    private LocalDateTime subscribedAt;
    private LocalDateTime expiresAt;

    public static SubscriptionResponse from(UserSubscription s) {
        SubscriptionTier tier = s.getTier();
        return SubscriptionResponse.builder()
            .userId(s.getUser().getId())
            .tier(tier.name())
            .active(s.isActive())
            .verified(tier.isVerified())
            .listingLimit(tier.getListingLimit())
            .boostCredits(tier.getBoostCredits())
            .monthlyPrice(tier.getMonthlyPrice())
            .subscribedAt(s.getSubscribedAt())
            .expiresAt(s.getExpiresAt())
            .build();
    }

    public static SubscriptionResponse free(Long userId) {
        SubscriptionTier tier = SubscriptionTier.FREE;
        return SubscriptionResponse.builder()
            .userId(userId)
            .tier(tier.name())
            .active(false)
            .verified(tier.isVerified())
            .listingLimit(tier.getListingLimit())
            .boostCredits(tier.getBoostCredits())
            .monthlyPrice(tier.getMonthlyPrice())
            .subscribedAt(null)
            .expiresAt(null)
            .build();
    }
}
