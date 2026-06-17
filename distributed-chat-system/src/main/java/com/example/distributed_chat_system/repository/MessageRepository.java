package com.example.distributed_chat_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.distributed_chat_system.entity.Message;

@Repository
public interface MessageRepository
        extends JpaRepository<Message,Long> {

    List<Message> findByRoomIdOrderByTimestampAsc(
            Long roomId
    );

}