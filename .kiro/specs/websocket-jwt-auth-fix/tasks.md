# Implementation Plan: WebSocket JWT Authentication Fix

## Overview

Two files need code changes, one needs a dependency added, and one frontend file needs updating. Everything else (`JwtHandshakeInterceptor`, `CustomHandshakeHandler`, `SecurityConfig`) is already correct.

## Tasks

- [ ] 1. Add jqwik dependency to pom.xml
  - Add `net.jqwik:jqwik:1.9.3` with `<scope>test</scope>` to `pom.xml`
  - _Requirements: 2.1 (test infrastructure for property tests)_

- [x] 2. Fix and re-enable WebSocketAuthChannelInterceptor
  - [x] 2.1 Restore `@Component` annotation and fix `preSend` to rebuild the message
    - Remove the `//` comment from `@Component` at the top of `WebSocketAuthChannelInterceptor`
    - After mutating the accessor (calling `accessor.setUser(...)` and `accessor.setLeaveMutable(true)`), replace the final `return message;` with `return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());`
    - Apply the same rebuild return for the non-CONNECT branch so all frames return a rebuilt message
    - _Requirements: 2.2, 2.4, 1.1, 1.2_

  - [ ]* 2.2 Write property test for channel interceptor — CONNECT frame with valid JWT sets user (Property 2)
    - **Property 2: Channel interceptor attaches authenticated user to CONNECT message**
    - **Validates: Requirements 2.2, 2.4, 1.2**
    - Use jqwik `@Property` to generate valid email strings; for each, generate a real JWT via `JwtService`, construct a STOMP CONNECT `Message<byte[]>` with the token as native `Authorization` header, call `preSend`, and assert `StompHeaderAccessor.wrap(result).getUser()` is non-null with `getName()` equal to the email
    - Mock `UserRepository` so no database is needed
    - _Requirements: 2.2, 2.4_

  - [ ]* 2.3 Write property test for channel interceptor — invalid/absent JWT does not set user (Property 3)
    - **Property 3: Invalid or absent JWT does not set Principal and does not throw**
    - **Validates: Requirements 1.5, 4.2**
    - Use jqwik `@Property` to generate arbitrary strings (not valid JWTs); for each, construct a STOMP CONNECT `Message<byte[]>` with the string as `Authorization` native header; assert `preSend` returns non-null and `accessor.getUser()` is null, with no exception thrown
    - Also test with null `Authorization` header
    - _Requirements: 1.5, 4.2_

- [x] 3. Wire WebSocketAuthChannelInterceptor into WebSocketConfig
  - [x] 3.1 Inject `WebSocketAuthChannelInterceptor` and override `configureClientInboundChannel`
    - Add `WebSocketAuthChannelInterceptor` as a constructor-injected field in `WebSocketConfig`
    - Override `configureClientInboundChannel(ChannelRegistration registration)` and call `registration.interceptors(webSocketAuthChannelInterceptor)`
    - _Requirements: 2.1, 1.1, 1.2_

- [ ] 4. Checkpoint — compile and verify wiring
  - Ensure the project compiles: `mvn compile`
  - Ensure all tests pass, ask the user if questions arise

- [ ] 5. Write remaining unit and property tests
  - [ ]* 5.1 Write property test for JwtHandshakeInterceptor — valid token stores Authentication in attributes (Property 1)
    - **Property 1: Handshake with valid JWT establishes non-null session Principal**
    - **Validates: Requirements 1.1, 4.1, 4.3**
    - Use jqwik `@Property` with generated email strings; for each, create a real JWT, build a mock `ServletServerHttpRequest` with `Authorization: Bearer <token>`, call `beforeHandshake`, and assert `attributes.get("user")` is a non-null `UsernamePasswordAuthenticationToken` whose `getName()` equals the email
    - _Requirements: 4.1, 4.3_

  - [ ]* 5.2 Write unit test for JwtHandshakeInterceptor — absent/invalid token leaves attributes empty
    - Call `beforeHandshake` with no `Authorization` header; assert `attributes` does not contain key `"user"` and return value is `true`
    - Call `beforeHandshake` with a malformed token; assert same
    - _Requirements: 4.2_

  - [ ]* 5.3 Write property test for JwtAuthenticationFilter.shouldNotFilter (Property 4)
    - **Property 4: JwtAuthenticationFilter excludes all /chat/** paths**
    - **Validates: Requirements 3.3**
    - Use jqwik `@Property` with generated path suffix strings; for each, construct a mock `HttpServletRequest` whose `servletPath` is `/chat/` + suffix; assert `shouldNotFilter` returns `true`
    - Also assert `shouldNotFilter` returns `false` for `/api/auth/login`
    - _Requirements: 3.3_

- [ ] 6. Update React frontend — pass token as SockJS query parameter
  - In the frontend STOMP client setup, change the `webSocketFactory` to pass the JWT as a `?token=` query parameter on the SockJS URL:
    ```js
    webSocketFactory: () => new SockJS(`http://localhost:8080/chat?token=${localStorage.getItem("token")}`)
    ```
  - Keep `connectHeaders: { Authorization: "Bearer " + token }` as-is for the STOMP CONNECT frame
  - Update `WebSocketAuthChannelInterceptor.preSend` to fall back to the `?token=` query param when the native `Authorization` header is absent (read from `SimpMessageHeaderAccessor` session attributes if needed)
  - _Requirements: 5.2, 5.3_

- [ ] 7. Final checkpoint — Ensure all tests pass
  - Run `mvn test`
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster fix
- The critical path is tasks 2.1 → 3.1 → 4 — those three steps alone resolve the `Principal null` bug
- Task 6 (frontend query param) is only needed if SockJS falls back to HTTP long-polling in the target environment
- Property tests use jqwik and require the dependency added in task 1
