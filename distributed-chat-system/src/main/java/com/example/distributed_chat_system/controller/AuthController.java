package com.example.distributed_chat_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.distributed_chat_system.dto.AuthResponse;
import com.example.distributed_chat_system.dto.LoginRequest;
import com.example.distributed_chat_system.dto.RegisterRequest;
import com.example.distributed_chat_system.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
        System.out.println("====================AuthController Loaded ======================");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        System.out.println("End of register =================================== ");
        System.out.println("Registering user: " + request.getUsername());

        authService.register(request);

        return ResponseEntity.ok(
                "User Registered"
        );
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {

        String token =
                authService.login(request);

        return ResponseEntity.ok(
                new AuthResponse(token)
        );
    }
    
}