package com.example.distributed_chat_system.repository;

import com.example.distributed_chat_system.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomMemberRepository
        extends JpaRepository<RoomMember,Long>{

    boolean existsByRoomIdAndUserId(
            Long roomId,
            Long userId
    );

}