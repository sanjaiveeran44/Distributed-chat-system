package com.example.distributed_chat_system.repository;

import com.example.distributed_chat_system.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository
        extends JpaRepository<Room,Long>{

    Optional<Room> findByName(String name);
}