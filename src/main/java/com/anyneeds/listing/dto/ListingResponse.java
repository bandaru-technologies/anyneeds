package com.anyneeds.listing.dto;

import com.anyneeds.listing.entity.Listing;
import com.anyneeds.user.dto.UserProfileDto;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private String categoryName;
    private UserProfileDto user;
    private List<String> imageUrls;
    private String location;
    private String city;
    private String state;
    private String status;
    private String condition;
    private Boolean negotiable;
    private Long viewCount;
    private boolean boosted;
    private LocalDateTime createdAt;

    public static ListingResponse from(Listing l) {
        return ListingResponse.builder()
            .id(l.getId())
            .title(l.getTitle())
            .description(l.getDescription())
            .price(l.getPrice())
            .categoryId(l.getCategory().getId())
            .categoryName(l.getCategory().getName())
            .user(UserProfileDto.from(l.getUser()))
            .imageUrls(l.getImageUrls())
            .location(l.getLocation())
            .city(l.getCity())
            .state(l.getState())
            .status(l.getStatus().name())
            .condition(l.getCondition() != null ? l.getCondition().name() : null)
            .negotiable(l.getNegotiable())
            .viewCount(l.getViewCount())
            .boosted(l.getBoostedUntil() != null && l.getBoostedUntil().isAfter(java.time.LocalDateTime.now()))
            .createdAt(l.getCreatedAt())
            .build();
    }
}
