package com.anyneeds.chat.dto;

import com.anyneeds.chat.entity.Conversation;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversationDto {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Long listingId;
    private String listingTitle;
    private String listingThumbnail;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private LocalDateTime createdAt;

    public static ConversationDto from(Conversation c, Long viewerId) {
        boolean isBuyer = c.getBuyer().getId().equals(viewerId);
        int unread = isBuyer ? c.getBuyerUnread() : c.getSellerUnread();
        String thumbnail = c.getListing().getImageUrls() != null && !c.getListing().getImageUrls().isEmpty()
            ? c.getListing().getImageUrls().get(0) : null;

        return ConversationDto.builder()
            .id(c.getId())
            .buyerId(c.getBuyer().getId())
            .buyerName(c.getBuyer().getName() != null ? c.getBuyer().getName() : "Buyer")
            .sellerId(c.getSeller().getId())
            .sellerName(c.getSeller().getName() != null ? c.getSeller().getName() : "Seller")
            .listingId(c.getListing().getId())
            .listingTitle(c.getListing().getTitle())
            .listingThumbnail(thumbnail)
            .lastMessage(c.getLastMessage())
            .lastMessageAt(c.getLastMessageAt())
            .unreadCount(unread)
            .createdAt(c.getCreatedAt())
            .build();
    }
}
