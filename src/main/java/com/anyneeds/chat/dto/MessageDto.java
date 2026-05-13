package com.anyneeds.chat.dto;

import com.anyneeds.chat.entity.Message;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static MessageDto from(Message m) {
        return MessageDto.builder()
            .id(m.getId())
            .conversationId(m.getConversation().getId())
            .senderId(m.getSender().getId())
            .senderName(m.getSender().getName() != null ? m.getSender().getName() : "User")
            .content(m.getContent())
            .type(m.getType().name())
            .isRead(m.getIsRead())
            .createdAt(m.getCreatedAt())
            .build();
    }
}
