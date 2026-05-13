package com.anyneeds.analytics.service;

import com.anyneeds.analytics.dto.AnalyticsDashboardDto;
import com.anyneeds.analytics.dto.ListingAnalyticsDto;
import com.anyneeds.chat.repository.ConversationRepository;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingBoostRepository;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ListingRepository listingRepository;
    private final WishlistRepository wishlistRepository;
    private final ConversationRepository conversationRepository;
    private final ListingBoostRepository listingBoostRepository;

    public AnalyticsDashboardDto getDashboard(Long userId) {
        List<Listing> listings = listingRepository
            .findByUserIdAndStatusNotOrderByCreatedAtDesc(
                userId, Listing.ListingStatus.DELETED, PageRequest.of(0, 50))
            .getContent();

        LocalDateTime now = LocalDateTime.now();

        List<ListingAnalyticsDto> analyticsList = listings.stream().map(l -> {
            long views = l.getViewCount() != null ? l.getViewCount() : 0L;
            long saves = wishlistRepository.countByListingId(l.getId());
            long chats = conversationRepository.countByListingId(l.getId());
            boolean boosted = l.getBoostedUntil() != null && l.getBoostedUntil().isAfter(now);
            String thumbnail = l.getImageUrls() != null && !l.getImageUrls().isEmpty()
                ? l.getImageUrls().get(0) : null;

            return ListingAnalyticsDto.builder()
                .listingId(l.getId())
                .title(l.getTitle())
                .price(l.getPrice())
                .city(l.getCity())
                .status(l.getStatus().name())
                .thumbnail(thumbnail)
                .views(views)
                .saves(saves)
                .chats(chats)
                .boosted(boosted)
                .boostedUntil(l.getBoostedUntil())
                .createdAt(l.getCreatedAt())
                .build();
        }).toList();

        long totalViews = analyticsList.stream().mapToLong(ListingAnalyticsDto::getViews).sum();
        long totalSaves = analyticsList.stream().mapToLong(ListingAnalyticsDto::getSaves).sum();
        long totalChats = analyticsList.stream().mapToLong(ListingAnalyticsDto::getChats).sum();
        int activeListings = (int) analyticsList.stream()
            .filter(a -> "ACTIVE".equals(a.getStatus()))
            .count();

        return AnalyticsDashboardDto.builder()
            .totalViews(totalViews)
            .totalSaves(totalSaves)
            .totalChats(totalChats)
            .activeListings(activeListings)
            .listings(analyticsList)
            .build();
    }
}
