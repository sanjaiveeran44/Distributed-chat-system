package com.example.distributed_chat_system.model;

public class ChatMessage {

    private String sender;
    private String message;
    private String messageType;
    private String roomId;

    public ChatMessage() {
    }

    public ChatMessage(String sender, String message, String messageType, String roomId) {
        this.sender = sender;
        this.message = message;
        this.messageType = messageType;
        this.roomId = roomId;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
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