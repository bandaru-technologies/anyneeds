package com.anyneeds.referral.service;

import com.anyneeds.referral.dto.ReferralStatsDto;
import com.anyneeds.referral.entity.ReferralRecord;
import com.anyneeds.referral.repository.ReferralRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReferralService {

    private static final String BASE_URL = "https://salepe.in";

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;

    @Transactional
    public String getOrAssignCode(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getReferralCode() != null && !user.getReferralCode().isBlank()) {
            return user.getReferralCode();
        }
        String code = generateUniqueCode();
        user.setReferralCode(code);
        userRepository.save(user);
        return code;
    }

    public ReferralStatsDto getStats(Long userId) {
        String code = getOrAssignCode(userId);
        long total = referralRepository.countByReferrerId(userId);
        long rewarded = referralRepository.countByReferrerIdAndRewardClaimed(userId, true);
        long pending = total - rewarded;
        String link = BASE_URL + "/r/" + code;
        return ReferralStatsDto.builder()
            .referralCode(code)
            .totalReferrals(total)
            .rewardedReferrals(rewarded)
            .pendingReferrals(pending)
            .referralLink(link)
            .build();
    }

    @Transactional
    public void processReferral(Long newUserId, String referralCode) {
        if (referralCode == null || referralCode.isBlank()) return;
        userRepository.findByReferralCode(referralCode.toUpperCase())
            .ifPresent(referrer -> {
                if (!referrer.getId().equals(newUserId)) {
                    User referred = userRepository.findById(newUserId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                    referralRepository.save(ReferralRecord.builder()
                        .referrer(referrer)
                        .referred(referred)
                        .build());
                }
            });
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (userRepository.existsByReferralCode(code));
        return code;
    }
}
