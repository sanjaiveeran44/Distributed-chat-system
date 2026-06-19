package com.example.distributed_chat_system.redis;

import org.springframework.stereotype.Component;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import com.example.distributed_chat_system.model.ChatMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

@Component
public class RedisSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${server.port:8080}")
    private String port;
    
    public RedisSubscriber(SimpMessagingTemplate messagingTemplate){
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
    
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            System.out.println("=================== RECEIVING FROM REDIS ====================");
          
            ChatMessage chatMessage = objectMapper.readValue(message.getBody(), ChatMessage.class);
            chatMessage.setServerPort(port);
            
            System.out.println("Message: " + chatMessage.getMessage());
            System.out.println("Sender: " + chatMessage.getSender());
            System.out.println("Room ID: " + chatMessage.getRoomId());
            
            messagingTemplate.convertAndSend(
                "/topic/" + chatMessage.getRoomId(), chatMessage
            );
        } catch (Exception e) {
            System.err.println("RedisSubscriber Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}