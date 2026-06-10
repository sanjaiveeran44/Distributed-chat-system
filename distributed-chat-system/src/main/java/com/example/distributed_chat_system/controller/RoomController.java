package com.example.distributed_chat_system.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/room")
public class RoomController {
    @PostMapping("/create")
    public void createRoom() {
        System.out.println("Creating room");
    }

    @GetMapping("/list")
    public void listRooms() {
        System.out.println("Listing rooms");
    }

    @GetMapping("/{roomId}")
    public void getRoom() {
        System.out.println("Getting room");
    }
}
