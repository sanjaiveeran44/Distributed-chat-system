package com.example.distributed_chat_system.model;

public class ChatMessage {

    private String sender;
    private String message;
    private String messageType;

    public ChatMessage() {
    }

    public ChatMessage(String sender, String message, String messageType) {
        this.sender = sender;
        this.message = message;
        this.messageType = messageType;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
}