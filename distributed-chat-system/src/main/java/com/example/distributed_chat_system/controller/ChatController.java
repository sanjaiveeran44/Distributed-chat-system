package com.example.distributed_chat_system.controller;

import com.example.distributed_chat_system.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessage message
    ) {

        messagingTemplate.convertAndSend(
                "/topic/" + roomId,
                message
        );
    }

    @MessageMapping("/join/{roomId}")
    public void joinRoom(
            @DestinationVariable String roomId,
            @Payload ChatMessage message,
            SimpMessageHeaderAccessor headerAccessor
    ) {

        headerAccessor.getSessionAttributes()
                .put("username", message.getSender());
        headerAccessor.getSessionAttributes()
                .put("roomId", roomId);
        message.setType(com.example.distributed_chat_system.model.MessageType.JOIN);
        messagingTemplate.convertAndSend(
                "/topic/" + roomId,
                message
        );
    }
}