# Distributed Real-Time Chat Application

## Overview

A distributed real-time chat application built using Spring Boot, React, Redis, PostgreSQL, and Nginx. The project demonstrates secure authentication, WebSocket communication, persistent message storage, and horizontal scaling across multiple Spring Boot instances.

---

## Features

* JWT-based Authentication
* BCrypt Password Encryption
* Secure REST APIs
* WebSocket Authentication
* Create and Join Chat Rooms
* Real-time Room-based Messaging
* Persistent Chat History
* Redis Pub/Sub for Distributed Messaging
* PostgreSQL Message Storage
* Nginx Reverse Proxy and Load Balancing
* Multiple Spring Boot Instances

---

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* Spring WebSocket
* STOMP
* Redis
* PostgreSQL

### Frontend

* React
* SockJS
* STOMP.js

### Infrastructure

* Redis (Docker)
* Nginx

---

## Architecture

```text
                   Client
                      |
          HTTP / WebSocket Requests
                      |
                    Nginx
                /           \
               /             \
      Spring Boot #1    Spring Boot #2
              \            /
               \          /
                 Redis Pub/Sub
                      |
                 PostgreSQL
```

---

## Authentication

### REST Authentication

* User login with JWT.
* Passwords are encrypted using BCrypt.
* Every REST request is validated by `JWTAuthenticationFilter`.

### WebSocket Authentication

WebSocket connections are authenticated during the handshake using:

* `HandshakeInterceptor`
* `CustomHandshakeHandler`

A `Principal` is created once during the handshake and is available throughout the WebSocket session.

---

## Database

The application uses PostgreSQL with the following tables:

* Users
* Rooms
* Room Members
* Messages

All chat messages are permanently stored and can be retrieved as chat history.

---

## Message Flow

```text
Client
   |
ChatController
   |
MessageService
   |
Save Message (PostgreSQL)
   |
Redis Publisher
   |
Redis
   |
Redis Subscriber
   |
SimpMessagingTemplate
   |
Connected Clients
```

Messages are first stored in PostgreSQL and then published through Redis so every Spring Boot instance can broadcast them to its connected WebSocket clients.

---

## Horizontal Scaling

The application supports multiple Spring Boot instances running simultaneously.

Example:

```text
Server 1 -> localhost:8080
Server 2 -> localhost:8081
```

Both servers share:

* PostgreSQL
* Redis

This allows users connected to different servers to communicate seamlessly.

---

## Nginx

Nginx acts as the entry point for the application.

Responsibilities:

* Reverse Proxy
* HTTP Load Balancing
* WebSocket Proxying

Clients connect only to:

```text
http://localhost
```

Nginx distributes HTTP requests across backend servers, while each WebSocket connection remains attached to the server that handled its initial handshake.

---

## Project Structure

```text
client/
    React Frontend

server/
    controllers/
    services/
    repositories/
    security/
    websocket/
    redis/
    entities/
```

---

## How to Run

1. Start PostgreSQL.
2. Start Redis using Docker.
3. Run two Spring Boot instances:

```properties
server.port=8080
server.port=8081
```

4. Configure Nginx to proxy requests to both instances.
5. Start the React frontend.
6. Open multiple browser windows and verify real-time messaging across different server instances.

---

## Key Concepts Demonstrated

* Spring Security with JWT
* WebSocket Authentication
* STOMP Messaging
* Redis Pub/Sub
* Persistent Chat Storage
* Room-based Messaging
* Reverse Proxy
* Load Balancing
* Horizontal Scaling
* Distributed System Design

---

