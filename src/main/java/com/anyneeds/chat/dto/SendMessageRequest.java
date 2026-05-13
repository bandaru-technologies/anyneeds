package com.anyneeds.chat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SendMessageRequest {
    private String content;
    private String type = "TEXT";
}
