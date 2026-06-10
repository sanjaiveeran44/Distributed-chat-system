package com.example.distributed_chat_system.dto;

public class CreateRoomRequest {

    private String name;

    private String description;

    private Boolean isPrivate;

    public CreateRoomRequest() {
    }

    public CreateRoomRequest(String name, String description, Boolean isPrivate) {
        this.name = name;
        this.description = description;
        this.isPrivate = isPrivate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }

    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
}