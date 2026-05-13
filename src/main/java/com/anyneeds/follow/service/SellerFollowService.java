package com.anyneeds.follow.service;

import com.anyneeds.follow.dto.FollowStatusResponse;
import com.anyneeds.follow.entity.SellerFollow;
import com.anyneeds.follow.repository.SellerFollowRepository;
import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerFollowService {

    private final SellerFollowRepository sellerFollowRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    @Transactional
    public FollowStatusResponse toggle(Long followerId, Long sellerId) {
        if (followerId.equals(sellerId)) {
            throw new RuntimeException("You cannot follow yourself");
        }
        if (sellerFollowRepository.existsByFollowerIdAndSellerId(followerId, sellerId)) {
            sellerFollowRepository.deleteByFollowerIdAndSellerId(followerId, sellerId);
        } else {
            User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
            sellerFollowRepository.save(SellerFollow.builder()
                .follower(follower)
                .seller(seller)
                .build());
        }
        return buildStatus(followerId, sellerId);
    }

    public FollowStatusResponse getStatus(Long followerId, Long sellerId) {
        return buildStatus(followerId, sellerId);
    }

    private FollowStatusResponse buildStatus(Long followerId, Long sellerId) {
        boolean following = sellerFollowRepository.existsByFollowerIdAndSellerId(followerId, sellerId);
        long count = sellerFollowRepository.countBySellerId(sellerId);
        return FollowStatusResponse.builder()
            .following(following)
            .followersCount(count)
            .build();
    }

    public Page<ListingResponse> getFollowingFeed(Long followerId, Pageable pageable) {
        List<Long> sellerIds = sellerFollowRepository.findSellerIdsByFollowerId(followerId);
        if (sellerIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        return listingRepository.findByStatusAndUserIdInOrderByCreatedAtDesc(
            Listing.ListingStatus.ACTIVE, sellerIds, pageable)
            .map(ListingResponse::from);
    }

    public List<ListingResponse> getFollowingFeedPreview(Long followerId) {
        Page<ListingResponse> page = getFollowingFeed(followerId, PageRequest.of(0, 8));
        return page.getContent();
    }
}
