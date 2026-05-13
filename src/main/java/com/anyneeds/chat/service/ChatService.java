package com.anyneeds.chat.service;

import com.anyneeds.chat.dto.ConversationDto;
import com.anyneeds.chat.dto.MessageDto;
import com.anyneeds.chat.dto.SendMessageRequest;
import com.anyneeds.chat.entity.Conversation;
import com.anyneeds.chat.entity.Message;
import com.anyneeds.chat.repository.ConversationRepository;
import com.anyneeds.chat.repository.MessageRepository;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ConversationDto startOrGetConversation(Long buyerId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        Long sellerId = listing.getUser().getId();

        if (buyerId.equals(sellerId)) throw new RuntimeException("Cannot chat with yourself");

        Conversation conv = conversationRepository.findByBuyerIdAndListingId(buyerId, listingId)
            .orElseGet(() -> {
                User buyer = userRepository.findById(buyerId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                return conversationRepository.save(Conversation.builder()
                    .buyer(buyer)
                    .seller(listing.getUser())
                    .listing(listing)
                    .build());
            });

        return ConversationDto.from(conv, buyerId);
    }

    public List<ConversationDto> getMyConversations(Long userId) {
        return conversationRepository.findAllByParticipant(userId).stream()
            .map(c -> ConversationDto.from(c, userId))
            .toList();
    }

    public List<MessageDto> getMessages(Long userId, Long conversationId, int page) {
        Conversation conv = getAndVerifyAccess(userId, conversationId);
        return messageRepository
            .findByConversationIdOrderByCreatedAtAsc(conv.getId(), PageRequest.of(page, 50))
            .map(MessageDto::from)
            .toList();
    }

    @Transactional
    public MessageDto sendMessage(Long senderId, Long conversationId, SendMessageRequest req) {
        Conversation conv = getAndVerifyAccess(senderId, conversationId);
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.save(Message.builder()
            .conversation(conv)
            .sender(sender)
            .content(req.getContent().trim())
            .type(Message.MessageType.valueOf(req.getType() != null ? req.getType() : "TEXT"))
            .build());

        // Update conversation metadata
        conv.setLastMessage(message.getContent().length() > 80
            ? message.getContent().substring(0, 80) + "…"
            : message.getContent());
        conv.setLastMessageAt(LocalDateTime.now());

        boolean senderIsBuyer = conv.getBuyer().getId().equals(senderId);
        if (senderIsBuyer) conv.setSellerUnread(conv.getSellerUnread() + 1);
        else conv.setBuyerUnread(conv.getBuyerUnread() + 1);
        conversationRepository.save(conv);

        MessageDto dto = MessageDto.from(message);

        // Push real-time to both participants
        Long otherId = senderIsBuyer ? conv.getSeller().getId() : conv.getBuyer().getId();
        messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/inbox", dto);
        messagingTemplate.convertAndSendToUser(String.valueOf(otherId), "/queue/inbox", dto);

        return dto;
    }

    @Transactional
    public void markRead(Long userId, Long conversationId) {
        Conversation conv = getAndVerifyAccess(userId, conversationId);
        messageRepository.markAllRead(conversationId, userId);
        if (conv.getBuyer().getId().equals(userId)) conv.setBuyerUnread(0);
        else conv.setSellerUnread(0);
        conversationRepository.save(conv);
    }

    public long getUnreadCount(Long userId) {
        return conversationRepository.countTotalUnread(userId);
    }

    private Conversation getAndVerifyAccess(Long userId, Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conv.getBuyer().getId().equals(userId) && !conv.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return conv;
    }
}
