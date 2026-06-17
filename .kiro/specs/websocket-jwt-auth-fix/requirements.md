# Requirements Document

## Introduction

The distributed chat system uses Spring Boot 4.0.6 / Spring Framework 7.0.7 with STOMP over SockJS and JWT authentication. The WebSocket handshake interceptor and custom handshake handler are both executing and correctly storing the authenticated `Principal` during the HTTP upgrade phase. However, after the STOMP CONNECT frame is processed, `Principal principal` and `SimpMessageHeaderAccessor.getUser()` become `null` inside `@MessageMapping` handlers. This spec defines requirements for correctly propagating the JWT-authenticated `Principal` from the HTTP handshake through to every STOMP message handler.

## Glossary

- **JwtHandshakeInterceptor**: A `HandshakeInterceptor` that validates the JWT from the `Authorization` header during the HTTP WebSocket upgrade and stores a `UsernamePasswordAuthenticationToken` in the handshake attributes map.
- **CustomHandshakeHandler**: A `DefaultHandshakeHandler` subclass that reads the `Authentication` from the handshake attributes and returns it as the WebSocket session `Principal`.
- **WebSocketAuthChannelInterceptor**: A `ChannelInterceptor` (currently commented out / disabled) that intercepts inbound STOMP frames and can set the user on the `StompHeaderAccessor`.
- **STOMP Session**: The logical messaging session established after the STOMP CONNECT frame is processed on top of the WebSocket connection.
- **Principal**: A `java.security.Principal` representing the authenticated user, expected to be non-null inside `@MessageMapping` methods.
- **SimpMessageHeaderAccessor**: Spring's accessor for STOMP/WebSocket message headers, including the session user (`getUser()`).
- **ChannelInterceptor**: A Spring Messaging interface whose `preSend` hook runs before a message is dispatched, used here to attach authentication to non-CONNECT STOMP frames.
- **SecurityConfig**: The Spring Security `SecurityFilterChain` configuration bean.
- **WebSocketConfig**: The `WebSocketMessageBrokerConfigurer` that registers the STOMP endpoint, interceptors, and broker settings.

## Requirements

### Requirement 1: Authenticated Principal Available in STOMP Message Handlers

**User Story:** As a developer, I want the authenticated user's `Principal` to be non-null inside every `@MessageMapping` method, so that I can identify senders, enforce authorization, and associate messages with users without a `NullPointerException`.

#### Acceptance Criteria

1. WHEN a client sends a STOMP CONNECT frame with a valid `Authorization: Bearer <token>` header, THE System SHALL store a fully populated `UsernamePasswordAuthenticationToken` (with `UserDetails` principal and granted authorities) as the WebSocket session `Principal`.
2. WHEN a STOMP SEND or SUBSCRIBE frame is received for an established session, THE System SHALL carry the authenticated `Principal` from that session into the inbound channel message so that `SimpMessageHeaderAccessor.getUser()` returns a non-null value.
3. WHEN a `@MessageMapping` method declares a `Principal principal` parameter, THE System SHALL inject the authenticated `Principal` from the STOMP session rather than `null`.
4. WHEN a `@MessageMapping` method uses `SimpMessageHeaderAccessor accessor`, THE `accessor.getUser()` SHALL return the same `Principal` that was established at STOMP CONNECT time.
5. IF the `Authorization` header is absent or the JWT is invalid during the STOMP CONNECT frame, THEN THE System SHALL not set a `Principal` on the session, and the connection SHALL proceed without an authenticated user (downstream authorization is handled separately).

---

### Requirement 2: Channel Interceptor Propagates Principal on Every Inbound Frame

**User Story:** As a developer, I want a `ChannelInterceptor` registered on the inbound channel to propagate the session `Principal` to every non-CONNECT STOMP frame, so that the STOMP message broker does not lose authentication context between frames.

#### Acceptance Criteria

1. THE WebSocketConfig SHALL register a `ChannelInterceptor` on the inbound `clientInboundChannel` that runs for every STOMP frame.
2. WHEN the interceptor processes a STOMP CONNECT frame, THE Interceptor SHALL extract the JWT from the native `Authorization` header, validate it, construct a `UsernamePasswordAuthenticationToken`, and call `accessor.setUser(authentication)` with `accessor.setLeaveMutable(true)` before returning the rebuilt message.
3. WHEN the interceptor processes any non-CONNECT STOMP frame (SEND, SUBSCRIBE, etc.), THE Interceptor SHALL retrieve the existing session `Principal` from `accessor.getUser()` or the session registry and ensure it is present on the outgoing message.
4. THE Interceptor SHALL return a rebuilt message using `MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders())` after mutating the accessor, so that header changes are preserved.
5. IF `accessor.setLeaveMutable(true)` is not called before returning, THEN THE System SHALL still function correctly because the message is explicitly rebuilt with the mutated headers.

---

### Requirement 3: WebSocket Security Permits Handshake and STOMP Traffic

**User Story:** As a developer, I want the Spring Security filter chain to permit WebSocket handshake and SockJS transport requests without requiring HTTP-level JWT authentication, so that the WebSocket upgrade is not blocked before the handshake interceptor can extract the token.

#### Acceptance Criteria

1. THE SecurityConfig SHALL permit all requests matching `/chat/**` without requiring a pre-authenticated HTTP session.
2. WHEN a SockJS transport request (e.g., `/chat/info`, `/chat/<server>/<session>/websocket`) arrives, THE SecurityConfig SHALL allow it to pass through to the WebSocket endpoint.
3. THE JwtAuthenticationFilter SHALL continue to exclude `/chat/**` paths via `shouldNotFilter` so that HTTP-level JWT processing does not interfere with WebSocket upgrade requests.
4. WHILE CSRF protection is disabled globally, THE SecurityConfig SHALL ensure that the WebSocket endpoint is not unintentionally blocked by any other security mechanism.

---

### Requirement 4: Handshake Interceptor Stores Authentication in Attributes

**User Story:** As a developer, I want the `JwtHandshakeInterceptor` to reliably place the validated `Authentication` object into the handshake attributes under a well-known key, so that the `CustomHandshakeHandler` can read it and return it as the WebSocket session `Principal`.

#### Acceptance Criteria

1. WHEN the HTTP `Authorization` header contains a valid Bearer token, THE JwtHandshakeInterceptor SHALL validate the token, load `UserDetails`, create a `UsernamePasswordAuthenticationToken`, and store it in the `attributes` map under the key `"user"`.
2. WHEN the JWT is invalid or absent, THE JwtHandshakeInterceptor SHALL return `true` (allow handshake) without placing any value in the attributes map under `"user"`.
3. THE CustomHandshakeHandler SHALL read the `Authentication` from `attributes.get("user")` and return it as the session `Principal` from `determineUser(...)`.
4. IF `attributes.get("user")` is `null`, THEN THE CustomHandshakeHandler SHALL delegate to `super.determineUser(...)` to preserve default behaviour.

---

### Requirement 5: Frontend Sends JWT in STOMP CONNECT Headers

**User Story:** As a frontend developer, I want the React client to send the JWT in the STOMP CONNECT frame headers, so that both the WebSocket handshake interceptor and the channel interceptor can access the token.

#### Acceptance Criteria

1. THE React Client SHALL set `connectHeaders: { Authorization: "Bearer " + token }` on the `@stomp/stompjs` `Client` configuration so the token is included in the STOMP CONNECT frame.
2. THE React Client SHALL pass the same `Authorization` header in the `webSocketFactory` or SockJS constructor URL query parameter as a fallback for environments where custom HTTP headers during upgrade are not supported by SockJS.
3. WHEN the SockJS transport falls back to HTTP polling, THE React Client SHALL include the token in request headers or query parameters so that the channel interceptor can still read it from native headers.
