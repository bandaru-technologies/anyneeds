package com.anyneeds.referral.repository;

import com.anyneeds.referral.entity.ReferralRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<ReferralRecord, Long> {

    List<ReferralRecord> findAllByReferrerId(Long referrerId);

    long countByReferrerId(Long referrerId);

    long countByReferrerIdAndRewardClaimed(Long referrerId, boolean rewardClaimed);

    Optional<ReferralRecord> findByReferredId(Long referredId);
}
