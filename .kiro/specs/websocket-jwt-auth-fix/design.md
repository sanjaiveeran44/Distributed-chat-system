# Design Document: WebSocket JWT Authentication Fix

## Overview

The bug manifests as `Principal` being `null` inside `@MessageMapping` handlers despite the `JwtHandshakeInterceptor` and `CustomHandshakeHandler` both executing successfully during the HTTP WebSocket upgrade. This document explains the root cause specific to Spring Framework 7 / Spring Boot 4 and prescribes the exact changes needed to each affected component.

### Root Cause

In Spring Framework 7 (used by Spring Boot 4), the STOMP message processing pipeline does **not** automatically copy the WebSocket session `Principal` (set by `DefaultHandshakeHandler.determineUser`) into the headers of every inbound STOMP frame. The flow is:

```
HTTP Upgrade (WebSocket Handshake)
   └─► JwtHandshakeInterceptor.beforeHandshake()  → attributes["user"] = Authentication
   └─► CustomHandshakeHandler.determineUser()      → returns Authentication as Principal
          │
          ▼
WebSocket Session created with Principal = Authentication
          │
          ▼
STOMP CONNECT frame arrives on clientInboundChannel
   └─► No ChannelInterceptor active (commented out)
   └─► Broker processes CONNECT — session Principal is stored internally
          │
          ▼
STOMP SEND frame arrives on clientInboundChannel
   └─► New Message<> object created — does NOT automatically carry session Principal in headers
   └─► @MessageMapping handler called — Principal = null ← BUG
```

The session `Principal` established at handshake time lives in the `SimpSession` registry but is **not injected into individual STOMP message headers** unless a `ChannelInterceptor` explicitly does so. Spring Security's `AbstractSecurityWebSocketMessageBrokerConfigurer` (which handles this automatically in older setups) is not being used here. Without it, we must register a `ChannelInterceptor` on `clientInboundChannel` that re-attaches the `Principal` to each message.

The `WebSocketAuthChannelInterceptor` already exists but is **commented out** and **not wired** into `WebSocketConfig`. Enabling and wiring it correctly — along with fixing how the rebuilt message is returned — resolves the bug.

---

## Architecture

```
React Frontend
   │  connectHeaders: { Authorization: "Bearer <token>" }
   │  SockJS transport to /chat
   ▼
HTTP WebSocket Upgrade Request
   └─► JwtHandshakeInterceptor        (validates JWT, sets attributes["user"])
   └─► CustomHandshakeHandler         (reads attributes["user"], returns as session Principal)
          │
          ▼
WebSocket Session established (Principal = UsernamePasswordAuthenticationToken)
          │
          ▼
STOMP Frame arrives on clientInboundChannel
   └─► WebSocketAuthChannelInterceptor.preSend()
          ├─► CONNECT: extract JWT → validate → setUser(auth) → rebuild message
          └─► Other frames: read session user → setUser → rebuild message
          │
          ▼
STOMP Message Broker / @MessageMapping handler
   └─► Principal principal ≠ null ✓
   └─► accessor.getUser() ≠ null ✓
```

---

## Components and Interfaces

### 1. JwtHandshakeInterceptor (no functional change needed)

The current implementation is correct. It reads the `Authorization` header, validates the JWT, and stores a `UsernamePasswordAuthenticationToken` in `attributes["user"]`. No changes required.

```java
// Current implementation is correct — no changes needed
public boolean beforeHandshake(..., Map<String, Object> attributes) {
    // ... validates JWT ...
    attributes.put("user", authentication); // ✓ correct key
    return true;
}
```

### 2. CustomHandshakeHandler (no functional change needed)

The current implementation is correct. It reads `attributes.get("user")` and returns it as the `Principal`. No changes required.

```java
// Current implementation is correct — no changes needed
protected Principal determineUser(..., Map<String, Object> attributes) {
    Authentication auth = (Authentication) attributes.get("user");
    return auth != null ? auth : super.determineUser(...);
}
```

### 3. WebSocketAuthChannelInterceptor (re-enable and fix)

This is the key fix. The interceptor must be:
- Un-commented (the `@Component` annotation restored or the class instantiated in config)
- Wired into `WebSocketConfig.configureClientInboundChannel()`
- Fixed to **rebuild the message** after mutating the accessor (required in Spring Framework 7)

**Critical fix — message must be rebuilt:**

```java
// WRONG — mutations to accessor are lost if message is immutable
return message;

// CORRECT — rebuild message with mutated headers
return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
```

Spring Framework 7 makes messages immutable by default after initial construction. When `StompHeaderAccessor.wrap(message)` is called, it wraps the existing headers. Calling `accessor.setUser(...)` mutates the wrapped accessor's copy but **not** the original message unless the message is explicitly rebuilt. The interceptor must call `MessageBuilder.createMessage(payload, accessor.getMessageHeaders())` to return a new message that carries the mutated headers.

**For non-CONNECT frames**, the session `Principal` is available via `SimpMessageHeaderAccessor` — specifically from the `simpUser` message header that Spring populates from the session registry. The interceptor should extract the user from the session user header if available:

```java
// For non-CONNECT frames, the user may already be on the message
// if the broker set simpUser from the session registry.
// If not, we need to retrieve it from the session registry or rely on CONNECT having set it.
```

The cleanest and most robust approach is: on CONNECT, validate JWT and call `accessor.setUser(auth)` + rebuild. On all other frames, if `accessor.getUser()` is null, the `SimpSession` registry can be consulted, but in practice the broker already propagates `simpUser` from the session state. The interceptor only needs to handle CONNECT explicitly.

### 4. WebSocketConfig (wire the interceptor)

Must override `configureClientInboundChannel` to register the interceptor:

```java
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(webSocketAuthChannelInterceptor);
}
```

### 5. SecurityConfig (no change needed)

The existing config already permits `/chat/**` and the `JwtAuthenticationFilter` already excludes `/chat/**` via `shouldNotFilter`. No changes required.

### 6. React Frontend

The `connectHeaders` with `Authorization` are already being sent. For SockJS environments where HTTP upgrade headers may not be forwarded, also pass the token as a query parameter on the SockJS URL:

```js
// Pass token as query param so SockJS HTTP transport requests also carry it
new SockJS(`http://localhost:8080/chat?token=${localStorage.getItem("token")}`)
```

The channel interceptor can then fall back to reading `?token=` from the SockJS request URL if the native `Authorization` header is missing on CONNECT.

---

## Data Models

No new data models. The existing types are:

- `UsernamePasswordAuthenticationToken` (Spring Security) — used as both `Authentication` and `Principal`
- `UserDetails` / `User` entity — the principal's backing object
- `StompHeaderAccessor` — STOMP frame headers accessor
- `Message<byte[]>` — the inbound channel message type

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Handshake with valid JWT establishes non-null session Principal

*For any* valid JWT token belonging to an existing user, after `JwtHandshakeInterceptor.beforeHandshake()` and `CustomHandshakeHandler.determineUser()` execute, the returned `Principal` is non-null and its `getName()` equals the user's email address.

**Validates: Requirements 1.1, 4.1, 4.3**

---

### Property 2: Channel interceptor attaches authenticated user to CONNECT message

*For any* inbound STOMP CONNECT `Message<>` containing a valid `Authorization: Bearer <token>` native header, after `WebSocketAuthChannelInterceptor.preSend()` executes, the returned message's `StompHeaderAccessor.getUser()` is a non-null `UsernamePasswordAuthenticationToken` whose `getName()` equals the token's subject claim.

**Validates: Requirements 2.2, 2.4, 1.2**

---

### Property 3: Invalid or absent JWT does not set Principal and does not throw

*For any* inbound STOMP CONNECT `Message<>` where the `Authorization` header is absent, malformed, or contains an invalid/expired JWT, `WebSocketAuthChannelInterceptor.preSend()` SHALL return a non-null message without throwing an exception, and the returned message's `StompHeaderAccessor.getUser()` SHALL be null.

**Validates: Requirements 1.5, 4.2**

---

### Property 4: JwtAuthenticationFilter excludes all /chat/** paths

*For any* `HttpServletRequest` whose `servletPath` starts with `/chat`, `JwtAuthenticationFilter.shouldNotFilter()` SHALL return `true`.

**Validates: Requirements 3.3**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| JWT absent on CONNECT | Interceptor skips setting user; connection continues unauthenticated |
| JWT invalid/expired on CONNECT | Interceptor catches exception, skips setting user, connection continues |
| `attributes["user"]` null in handshake handler | Delegates to `super.determineUser()` |
| `accessor.getUser()` null for non-CONNECT frame | Logged; message passes through; downstream handler must handle null principal |
| `NullPointerException` in `ChatController` | Fixed by ensuring Principal is always set before controller is invoked |

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. Unit tests verify specific concrete scenarios; property-based tests verify universal correctness across all generated inputs.

### Property-Based Testing Library

**Library**: [jqwik](https://jqwik.net/) — a property-based testing framework for JUnit 5, compatible with Spring Boot 4 test infrastructure.

Add to `pom.xml`:
```xml
<dependency>
    <groupId>net.jqwik</groupId>
    <artifactId>jqwik</artifactId>
    <version>1.9.3</version>
    <scope>test</scope>
</dependency>
```

Each property-based test must run a minimum of **100 tries** (jqwik default is 1000, which is sufficient).

### Unit Tests

- `JwtHandshakeInterceptorTest` — test with valid token (attributes["user"] set), null header (no-op), invalid token (no-op, returns true)
- `CustomHandshakeHandlerTest` — test with populated attributes (returns Authentication), null attributes (delegates to super)
- `WebSocketAuthChannelInterceptorTest` — test CONNECT frame with valid/invalid/null JWT, test non-CONNECT frame passthrough
- `SecurityConfigTest` — verify `/chat/**` returns 200/101 without auth header (MockMvc)

### Property Tests

Each property-based test is annotated with its design property for traceability:

```
// Feature: websocket-jwt-auth-fix, Property 1: Handshake with valid JWT establishes non-null session Principal
// Feature: websocket-jwt-auth-fix, Property 2: Channel interceptor attaches authenticated user to CONNECT message
// Feature: websocket-jwt-auth-fix, Property 3: Invalid or absent JWT does not set Principal and does not throw
// Feature: websocket-jwt-auth-fix, Property 4: JwtAuthenticationFilter excludes all /chat/** paths
```

Property tests generate random inputs (email addresses, token strings, paths) using jqwik's `@ForAll` and `@Provide` annotations to cover the full input space.
