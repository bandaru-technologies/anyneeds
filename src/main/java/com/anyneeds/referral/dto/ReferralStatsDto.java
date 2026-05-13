package com.anyneeds.referral.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReferralStatsDto {
    private String referralCode;
    private long totalReferrals;
    private long rewardedReferrals;
    private long pendingReferrals;
    private String referralLink;
}
