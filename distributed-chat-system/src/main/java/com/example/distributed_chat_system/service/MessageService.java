package com.example.distributed_chat_system.service;

import org.springframework.stereotype.Service;

import com.example.distributed_chat_system.repository.MessageRepository;
import com.example.distributed_chat_system.repository.UserRepository;
import com.example.distributed_chat_system.model.ChatMessage;
import com.example.distributed_chat_system.entity.Message;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository){
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public Message saveMessage(Message dbMessage){
        return messageRepository.saveMessage(dbMessage);
    }
}