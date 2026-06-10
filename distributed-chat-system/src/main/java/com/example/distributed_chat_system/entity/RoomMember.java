package com.example.distributed_chat_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_members")
public class RoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="room_id")
    private Long roomId;

    @Column(name="user_id")
    private Long userId;

    @Column(name="joined_at")
    private LocalDateTime joinedAt;

    public RoomMember() {
    }

    public RoomMember(Long roomId, Long userId, LocalDateTime joinedAt) {
        this.roomId = roomId;
        this.userId = userId;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}