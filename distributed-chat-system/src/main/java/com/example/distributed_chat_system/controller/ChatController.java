package com.example.distributed_chat_system.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.distributed_chat_system.model.ChatMessage;
import com.example.distributed_chat_system.service.MessageService;
import com.example.distributed_chat_system.entity.Message;
import com.example.distributed_chat_system.entity.User;
import com.example.distributed_chat_system.service.UserService;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserService userService;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService, UserService userService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.userService = userService;
    }

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
                userService.findByEmail(email)
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

        messageService.saveMessage(dbMessage);

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