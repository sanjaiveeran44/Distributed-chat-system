package com.example.distributed_chat_system.model;

import lombok.AllArgsConstructor;   
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.distributed_chat_system.model.MessageType;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ChatMessage {
    private String sender;
    private String content;
    private MessageType messageType;
    private String room;

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public String getRoom() {
        return room;
    }
    
    public void setRoom(String room) {
        this.room = room;
    }

    @Override
    public String toString() {
        return sender + ": " + content;
    }
}
