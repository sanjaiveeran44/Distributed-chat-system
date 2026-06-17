package com.example.distributed_chat_system.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
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
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7);

                try {
                    String email = jwtService.extractEmail(token);

                    UserDetails userDetails =
                            userDetailsService.loadUserByUsername(email);

                    if (jwtService.validateToken(token, userDetails.getUsername())) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        accessor.setUser(authentication);
                        accessor.setLeaveMutable(true);

                        System.out.println("===== CHANNEL INTERCEPTOR: user authenticated: "
                                + authentication.getName() + " =====");
                    }

                } catch (Exception e) {
                    System.out.println("===== CHANNEL INTERCEPTOR: JWT validation failed: "
                            + e.getMessage() + " =====");
                }
            }

            // Rebuild the message so the mutated headers (including simpUser) are preserved.
            // In Spring Framework 7 the original Message<?> is immutable; wrapping and
            // mutating the accessor only changes the accessor's internal copy unless we
            // explicitly create a new Message from the updated headers.
            return MessageBuilder.createMessage(
                    message.getPayload(),
                    accessor.getMessageHeaders()
            );
        }

        // For non-CONNECT frames, pass through unchanged — the broker already copies
        // simpUser from the session registry into each message on the inbound channel.
        return message;
    }
}
