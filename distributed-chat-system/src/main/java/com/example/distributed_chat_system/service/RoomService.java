package com.example.distributed_chat_system.service;

import com.example.distributed_chat_system.dto.CreateRoomRequest;
import com.example.distributed_chat_system.dto.RoomResponse;
import com.example.distributed_chat_system.entity.Room;
import com.example.distributed_chat_system.entity.RoomMember;
import com.example.distributed_chat_system.entity.User;
import com.example.distributed_chat_system.repository.RoomMemberRepository;
import com.example.distributed_chat_system.repository.RoomRepository;
import com.example.distributed_chat_system.repository.UserRepository;
import com.example.distributed_chat_system.repository.MessageRepository;
import com.example.distributed_chat_system.entity.Message;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public RoomService(
            RoomRepository roomRepository,
            RoomMemberRepository roomMemberRepository,
            UserRepository userRepository,
            MessageRepository messageRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    public RoomResponse createRoom(
            CreateRoomRequest request,
            Authentication authentication
    ) {

        if (roomRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Room already exists");
        }

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = new Room(
                request.getName(),
                request.getDescription(),
                user.getId(),
                request.getIsPrivate()
        );
        Room savedRoom =
                roomRepository.save(room);

        RoomMember member =
                new RoomMember();

        member.setRoomId(savedRoom.getId());
        member.setUserId(user.getId());
        member.setJoinedAt(LocalDateTime.now());

        roomMemberRepository.save(member);

        return new RoomResponse(
                savedRoom.getId(),
                savedRoom.getName(),
                savedRoom.getIsPrivate()
        );
    }

    public List<Room> getAllRooms() {

        return roomRepository.findAll();

    }

    public void joinRoom(
            Long roomId,
            Authentication authentication
    ) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"));

        if (!roomRepository.existsById(roomId)) {
            throw new RuntimeException("Room not found");
        }

        if (roomMemberRepository.existsByRoomIdAndUserId(
                roomId,
                user.getId()
        )) {

            return;
        }

        RoomMember member =
                new RoomMember();

        member.setRoomId(roomId);
        member.setUserId(user.getId());
        member.setJoinedAt(LocalDateTime.now());

        roomMemberRepository.save(member);
    }

    public List<Message> getRoomMessages(Long roomId) {
        return messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }
}