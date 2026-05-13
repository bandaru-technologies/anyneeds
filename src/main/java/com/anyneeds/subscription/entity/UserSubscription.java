package com.anyneeds.subscription.entity;

import com.anyneeds.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_subscriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private SubscriptionTier tier;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "subscribed_at")
    private LocalDateTime subscribedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isActive() {
        return tier != SubscriptionTier.FREE
            && expiresAt != null
            && expiresAt.isAfter(LocalDateTime.now());
    }

    public enum SubscriptionTier {
        FREE, STARTER, DEALER, PRO;

        public int getMonthlyPrice() {
            return switch (this) {
                case FREE -> 0;
                case STARTER -> 299;
                case DEALER -> 999;
                case PRO -> 1999;
            };
        }

        public int getListingLimit() {
            return switch (this) {
                case FREE -> 5;
                case STARTER -> 15;
                case DEALER, PRO -> Integer.MAX_VALUE;
            };
        }

        public int getBoostCredits() {
            return switch (this) {
                case FREE -> 0;
                case STARTER -> 1;
                case DEALER -> 2;
                case PRO -> 5;
            };
        }

        public boolean isVerified() {
            return this != FREE;
        }
    }
}
