package com.example.distributed_chat_system.service;

import org.springframework.stereotype.Service;

import com.example.distributed_chat_system.repository.MessageRepository;
import com.example.distributed_chat_system.repository.UserRepository;
import com.example.distributed_chat_system.model.ChatMessage;
import com.example.distributed_chat_system.entity.Message;
import com.example.distributed_chat_system.redis.RedisPublisher;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RedisPublisher redisPublisher;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            RedisPublisher redisPublisher
            ){
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.redisPublisher = redisPublisher;
    }

    public Message saveMessage(Message dbMessage){
        return messageRepository.saveMessage(dbMessage);
    }

    public void publishMessage(ChatMessage message){
        redisPublisher.publish(message);
    }
}