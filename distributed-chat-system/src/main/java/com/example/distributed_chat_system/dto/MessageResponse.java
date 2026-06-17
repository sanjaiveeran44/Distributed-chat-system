package com.example.distributed_chat_system.dto;

import java.time.LocalDateTime;

public class MessageResponse {

    private String sender;

    private String message;

    private LocalDateTime timestamp;

    public MessageResponse(
            String sender,
            String message,
            LocalDateTime timestamp
    ) {

        this.sender = sender;
        this.message = message;
        this.timestamp = timestamp;

    }

    public String getSender() {
        return sender;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

}