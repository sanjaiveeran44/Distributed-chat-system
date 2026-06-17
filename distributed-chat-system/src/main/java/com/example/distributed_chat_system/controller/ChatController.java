package com.example.distributed_chat_system.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;


import com.example.distributed_chat_system.model.ChatMessage;
import com.example.distributed_chat_system.repository.MessageRepository;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageRepository messageRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepository = messageRepository;
    }

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(

            @DestinationVariable String roomId,

            @Payload ChatMessage message,

            SimpMessageHeaderAccessor accessor
    ) {

        System.out.println(
                "Authenticated User : " + accessor.getUser()
        );

        message.setSender(accessor.getUser().getName());
        messagingTemplate.convertAndSend(
                "/topic/" + roomId,
                message
        );

    }

    @MessageMapping("/join/{roomId}")
    public void joinRoom(

            @DestinationVariable String roomId,

            @Payload ChatMessage message,

            Principal principal

    ) {

        message.setSender(principal.getName());

        messagingTemplate.convertAndSend(

                "/topic/" + roomId,

                message

        );

    }
}