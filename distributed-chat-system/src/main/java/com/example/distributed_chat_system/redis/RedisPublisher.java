package com.example.distributed_chat_system.redis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import com.example.distributed_chat_system.model.ChatMessage;

@Component
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${redis.chat.channel}")
    private String channel;

    public RedisPublisher(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void publish(ChatMessage message) {
        System.out.println("=================== PUBLISHING TO REDIS ====================");
        System.out.println("Message: " + message.getMessage());
        System.out.println("Sender: " + message.getSender());
        System.out.println("Room ID: " + message.getRoomId());
        redisTemplate.convertAndSend(channel, message);
    }
}