package com.anyneeds.listing.service;

import com.anyneeds.listing.dto.BoostResponse;
import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.entity.ListingBoost;
import com.anyneeds.listing.repository.ListingBoostRepository;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoostService {

    private final ListingRepository listingRepository;
    private final ListingBoostRepository listingBoostRepository;
    private final UserRepository userRepository;

    @Transactional
    public BoostResponse boost(Long userId, Long listingId, ListingBoost.BoostPlan plan) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (!listing.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: you do not own this listing");
        }
        if (listing.getStatus() != Listing.ListingStatus.ACTIVE) {
            throw new RuntimeException("Only active listings can be boosted");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime base = (listing.getBoostedUntil() != null && listing.getBoostedUntil().isAfter(now))
            ? listing.getBoostedUntil()
            : now;
        LocalDateTime expiresAt = base.plusDays(plan.getDurationDays());

        ListingBoost boost = ListingBoost.builder()
            .listing(listing)
            .user(user)
            .plan(plan)
            .amountPaid(plan.getPrice())
            .startedAt(now)
            .expiresAt(expiresAt)
            .build();

        listing.setBoostedUntil(expiresAt);
        listingRepository.save(listing);
        return BoostResponse.from(listingBoostRepository.save(boost));
    }

    public List<BoostResponse> getActiveBoosts(Long userId) {
        return listingBoostRepository.findActiveByUserId(userId, LocalDateTime.now())
            .stream()
            .map(BoostResponse::from)
            .toList();
    }

    public List<ListingResponse> getFeaturedListings() {
        LocalDateTime now = LocalDateTime.now();
        return listingBoostRepository.findFeaturedListings(now)
            .stream()
            .map(ListingResponse::from)
            .toList();
    }
}
