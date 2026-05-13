package com.anyneeds.chat.controller;

import com.anyneeds.chat.dto.ConversationDto;
import com.anyneeds.chat.dto.MessageDto;
import com.anyneeds.chat.dto.SendMessageRequest;
import com.anyneeds.chat.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ConversationDto> start(
        HttpServletRequest request, @RequestBody Map<String, Long> body) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(chatService.startOrGetConversation(userId, body.get("listingId")));
    }

    @GetMapping
    public ResponseEntity<List<ConversationDto>> list(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(chatService.getMyConversations(userId));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> messages(
        HttpServletRequest request,
        @PathVariable Long id,
        @RequestParam(defaultValue = "0") int page) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(chatService.getMessages(userId, id, page));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> send(
        HttpServletRequest request, @PathVariable Long id,
        @RequestBody SendMessageRequest req) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(chatService.sendMessage(userId, id, req));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        chatService.markRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Long>> unreadCount(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(Map.of("count", chatService.getUnreadCount(userId)));
    }
}
