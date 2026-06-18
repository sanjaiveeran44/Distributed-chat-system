package com.example.distributed_chat_system.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

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
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessage message,
            SimpMessageHeaderAccessor accessor
    ) {

        if(accessor.getUser() == null){
            return;
        }

        String email =
                accessor.getUser().getName();

        User sender =
                userRepository.findByEmail(email)
                        .orElseThrow();

        Message dbMessage = new Message();

        dbMessage.setRoomId(
                Long.parseLong(roomId)
        );

        dbMessage.setSenderId(
                sender.getId()
        );

        dbMessage.setMessage(
                message.getMessage()
        );

        dbMessage.setTimestamp(
                LocalDateTime.now()
        );

        messageRepository.save(dbMessage);

        message.setSender(email);

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

        if (principal == null) {
            System.out.println("ERROR: Principal is null in joinRoom — rejecting");
            return;
        }

        message.setSender(principal.getName());

        messagingTemplate.convertAndSend(

                "/topic/" + roomId,

                message

        );

    }
}