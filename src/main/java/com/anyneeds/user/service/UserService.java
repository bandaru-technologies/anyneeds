package com.anyneeds.user.service;

import com.anyneeds.follow.repository.SellerFollowRepository;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.referral.service.ReferralService;
import com.anyneeds.subscription.entity.UserSubscription;
import com.anyneeds.subscription.repository.UserSubscriptionRepository;
import com.anyneeds.user.dto.SellerPublicDto;
import com.anyneeds.user.dto.UserProfileDto;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final SellerFollowRepository sellerFollowRepository;
    private final ReferralService referralService;

    @Transactional
    public User findOrCreateUser(String phoneNumber) {
        return findOrCreateUser(phoneNumber, null);
    }

    @Transactional
    public User findOrCreateUser(String phoneNumber, String referralCode) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .orElseGet(() -> {
                User newUser = userRepository.save(User.builder().phoneNumber(phoneNumber).build());
                referralService.getOrAssignCode(newUser.getId());
                if (referralCode != null && !referralCode.isBlank()) {
                    referralService.processReferral(newUser.getId(), referralCode);
                }
                return newUser;
            });
    }

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileDto.from(user);
    }

    public SellerPublicDto getSellerPublicProfile(Long userId) {
        return getSellerPublicProfile(userId, null);
    }

    public SellerPublicDto getSellerPublicProfile(Long userId, Long viewerId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        String displayName = user.getName() != null ? user.getName() : "Seller";
        String initials = displayName.trim().isEmpty() ? "S"
            : String.valueOf(displayName.trim().charAt(0)).toUpperCase();
        long active = listingRepository.countByUserIdAndStatus(userId, Listing.ListingStatus.ACTIVE);
        long total = listingRepository.countByUserIdAndStatusNot(userId, Listing.ListingStatus.DELETED);
        boolean verified = userSubscriptionRepository.findByUserId(userId)
            .map(s -> s.getTier().isVerified() && s.isActive())
            .orElse(false);
        long followersCount = sellerFollowRepository.countBySellerId(userId);
        boolean following = viewerId != null && sellerFollowRepository.existsByFollowerIdAndSellerId(viewerId, userId);
        return SellerPublicDto.builder()
            .id(user.getId())
            .name(displayName)
            .initials(initials)
            .joinedAt(user.getCreatedAt())
            .activeListings(active)
            .totalListings(total)
            .verified(verified)
            .followersCount(followersCount)
            .following(following)
            .build();
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UserProfileDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        return UserProfileDto.from(userRepository.save(user));
    }
}
