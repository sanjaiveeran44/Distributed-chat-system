package com.example.distributed_chat_system.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.example.distributed_chat_system.service.CustomUserDetailsService;
import com.example.distributed_chat_system.service.JwtService;

@Component
public class WebSocketAuthChannelInterceptor
        implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public WebSocketAuthChannelInterceptor(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        // Use MessageHeaderAccessor.getAccessor to get a mutable accessor.
        // StompHeaderAccessor.wrap() in Spring Framework 7 returns an immutable view;
        // getAccessor() returns the existing mutable one if present, or creates a new one.
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message, StompHeaderAccessor.class
        );

        System.out.println("===== CHANNEL INTERCEPTOR preSend, command="
                + (accessor != null ? accessor.getCommand() : "null") + " =====");

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            System.out.println("===== CONNECT Authorization header: " + authHeader + " =====");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7);

                try {
                    String email = jwtService.extractEmail(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtService.validateToken(token, userDetails.getUsername())) {

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        accessor.setLeaveMutable(true);
                        accessor.setUser(auth);

                        System.out.println("===== CHANNEL INTERCEPTOR: authenticated "
                                + auth.getName() + " =====");

                        return MessageBuilder.createMessage(
                                message.getPayload(),
                                accessor.getMessageHeaders()
                        );
                    }

                } catch (Exception e) {
                    System.out.println("===== CHANNEL INTERCEPTOR: JWT error: "
                            + e.getMessage() + " =====");
                }
            }
        }

        return message;
    }
}
