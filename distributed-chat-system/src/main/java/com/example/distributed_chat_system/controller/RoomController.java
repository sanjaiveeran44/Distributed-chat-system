package com.example.distributed_chat_system.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.distributed_chat_system.dto.CreateRoomRequest;
import com.example.distributed_chat_system.dto.RoomResponse;
import com.example.distributed_chat_system.entity.Room;
import com.example.distributed_chat_system.service.RoomService;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomService roomService;

    public RoomController(
            RoomService roomService
    ) {
        this.roomService = roomService;
        System.out.println("RoomController initialized");
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(

            @RequestBody CreateRoomRequest request,
            Authentication authentication

    ) {
        System.out.println("===============Creating room=====================: " + request.getName());
        System.out.println("===============Authentication: =================" + authentication.getName());

        return ResponseEntity.ok(

                roomService.createRoom(
                        request,
                        authentication
                )
        );
    }
    @GetMapping
    public ResponseEntity<List<Room>> getRooms() {

        return ResponseEntity.ok(
                roomService.getAllRooms()
        );

    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<String> joinRoom(
            @PathVariable Long roomId,
            Authentication authentication
    ) {

        roomService.joinRoom(
                roomId,
                authentication
        );

        return ResponseEntity.ok(
                "Joined Successfully"
        );
        @GetMapping("/api/rooms/{roomId}/messages")

    }
    public List<Message> getRoomMessages(
        @PathVariable Long roomId) {
        return messageRepository
                .findByRoomIdOrderByTimestampAsc(roomId);
    }
}