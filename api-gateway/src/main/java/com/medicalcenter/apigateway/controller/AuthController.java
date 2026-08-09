package com.medicalcenter.apigateway.controller;

import com.medicalcenter.apigateway.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String token = jwtUtil.generateToken(username, "PATIENT");
        return ResponseEntity.ok(Map.of("token", token));
    }
}