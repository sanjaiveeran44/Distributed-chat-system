package com.example.distributed_chat_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_private")
    private Boolean isPrivate;

    public Room(String name, String description, Long createdBy,Boolean isPrivate) {
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.isPrivate = isPrivate;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
}