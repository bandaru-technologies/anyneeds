package com.anyneeds.chat.controller;

import com.anyneeds.chat.dto.MessageDto;
import com.anyneeds.chat.dto.SendMessageRequest;
import com.anyneeds.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat/{conversationId}")
    public void sendMessage(@DestinationVariable Long conversationId,
                            SendMessageRequest req,
                            Principal principal) {
        if (principal == null || req.getContent() == null || req.getContent().isBlank()) return;
        Long senderId = Long.parseLong(principal.getName());
        chatService.sendMessage(senderId, conversationId, req);
    }
}
