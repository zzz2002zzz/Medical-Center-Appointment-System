package com.medicalcenter.apigateway.controller;

import com.medicalcenter.apigateway.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/oauth")
public class OAuth2TokenController {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${oauth.client-id:medical-center-client}")
    private String validClientId;

    @Value("${oauth.client-secret:demo-client-secret-2026}")
    private String validClientSecret;

    /**
     * OAuth2 Client Credentials Grant (RFC 6749, Section 4.4).
     * POST /oauth/token
     * Content-Type: application/x-www-form-urlencoded
     * grant_type=client_credentials&client_id=...&client_secret=...
     */
    @PostMapping(value = "/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Map<String, Object>> issueToken(HttpServletRequest request) throws Exception {

        Map<String, String> params = parseFormBody(request);

        String grantType = params.get("grant_type");
        String clientId = params.get("client_id");
        String clientSecret = params.get("client_secret");

        if (!"client_credentials".equals(grantType)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "unsupported_grant_type"));
        }

        if (!validClientId.equals(clientId) || !validClientSecret.equals(clientSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "invalid_client"));
        }

        String token = jwtUtil.generateToken(clientId, "SERVICE");

        return ResponseEntity.ok(Map.of(
                "access_token", token,
                "token_type", "Bearer",
                "expires_in", 3600
        ));
    }

    private Map<String, String> parseFormBody(HttpServletRequest request) throws Exception {
        Map<String, String> result = new HashMap<>();
        StringBuilder body = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
        }
        for (String pair : body.toString().split("&")) {
            if (pair.isEmpty()) continue;
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String value = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            result.put(key, value);
        }
        return result;
    }
}