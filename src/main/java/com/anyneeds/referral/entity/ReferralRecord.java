package com.anyneeds.referral.entity;

import com.anyneeds.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "referral_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReferralRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id")
    private User referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_id", unique = true)
    private User referred;

    @Builder.Default
    @Column(name = "reward_claimed")
    private boolean rewardClaimed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
