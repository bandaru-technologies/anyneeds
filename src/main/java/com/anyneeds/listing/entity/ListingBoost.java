package com.anyneeds.listing.entity;

import com.anyneeds.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "listing_boosts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingBoost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private BoostPlan plan;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum BoostPlan {
        BASIC, STANDARD, PREMIUM;

        public int getDurationDays() {
            return switch (this) {
                case BASIC -> 3;
                case STANDARD -> 7;
                case PREMIUM -> 14;
            };
        }

        public BigDecimal getPrice() {
            return switch (this) {
                case BASIC -> BigDecimal.valueOf(99);
                case STANDARD -> BigDecimal.valueOf(249);
                case PREMIUM -> BigDecimal.valueOf(499);
            };
        }
    }
}
