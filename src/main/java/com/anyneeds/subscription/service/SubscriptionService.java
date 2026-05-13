package com.anyneeds.subscription.service;

import com.anyneeds.subscription.dto.SubscriptionResponse;
import com.anyneeds.subscription.entity.UserSubscription;
import com.anyneeds.subscription.entity.UserSubscription.SubscriptionTier;
import com.anyneeds.subscription.repository.UserSubscriptionRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionResponse getMySubscription(Long userId) {
        return userSubscriptionRepository.findByUserId(userId)
            .map(SubscriptionResponse::from)
            .orElseGet(() -> SubscriptionResponse.free(userId));
    }

    @Transactional
    public SubscriptionResponse subscribe(Long userId, SubscriptionTier tier) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        UserSubscription subscription = userSubscriptionRepository.findByUserId(userId)
            .orElseGet(() -> UserSubscription.builder().user(user).build());

        subscription.setTier(tier);
        subscription.setAmountPaid(BigDecimal.valueOf(tier.getMonthlyPrice()));
        subscription.setSubscribedAt(now);
        subscription.setExpiresAt(now.plusDays(30));

        return SubscriptionResponse.from(userSubscriptionRepository.save(subscription));
    }

    @Transactional
    public SubscriptionResponse cancel(Long userId) {
        UserSubscription subscription = userSubscriptionRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("No active subscription found"));

        subscription.setTier(SubscriptionTier.FREE);
        subscription.setExpiresAt(LocalDateTime.now());

        return SubscriptionResponse.from(userSubscriptionRepository.save(subscription));
    }
}
