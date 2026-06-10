package com.example.distributed_chat_system.service;

import com.example.distributed_chat_system.dto.CreateRoomRequest;
import com.example.distributed_chat_system.dto.RoomResponse;
import com.example.distributed_chat_system.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public RoomResponse createRoom(
            CreateRoomRequest request,
            String email){

        return null;
    }

    public List<RoomResponse> getAllRooms(){

        return null;
    }

    public void joinRoom(
            Long roomId,
            String email){

    }
}