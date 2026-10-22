package com.payflow.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String AUTH_KEY = "PAYFLOW_AUTHENTICATED";

    private final PasswordEncoder passwordEncoder;

    @Value("${PAYFLOW_ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${PAYFLOW_ADMIN_PASSWORD_HASH:}")
    private String adminPasswordHash;

    public AuthController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest body,
            HttpServletRequest request) {

        if (body == null
                || body.username() == null
                || body.password() == null
                || adminPasswordHash == null
                || adminPasswordHash.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", false,
                                 "message", "Invalid username or password"));
        }

        boolean usernameMatches =
                adminUsername != null
                && adminUsername.equals(body.username());

        boolean passwordMatches = false;
        if (usernameMatches) {
            try {
                passwordMatches =
                        passwordEncoder.matches(
                                body.password(), adminPasswordHash);
            } catch (IllegalArgumentException ignored) {
                passwordMatches = false;
            }
        }

        if (!usernameMatches || !passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", false,
                                 "message", "Invalid username or password"));
        }

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession session = request.getSession(true);
        session.setAttribute(AUTH_KEY, true);

        return ResponseEntity.ok(
                Map.of("authenticated", true,
                       "username", adminUsername));
    }

    @GetMapping("/session")
    public ResponseEntity<?> session(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null
                || !Boolean.TRUE.equals(session.getAttribute(AUTH_KEY))) {
            return ResponseEntity.ok(
                    Map.of("authenticated", false));
        }

        return ResponseEntity.ok(
                Map.of("authenticated", true,
                       "username", adminUsername));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(
                Map.of("authenticated", false,
                       "message", "Logged out"));
    }

    public record LoginRequest(String username, String password) {}
}
