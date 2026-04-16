package com.mphasis.skywaysairline.bookingservice.security;

import java.security.Key;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private static final Logger log =
            LoggerFactory.getLogger(JwtUtil.class);

    private final String SECRET =
            "myverystrongsecretkeythatismorethan32characterslong";

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public boolean validateToken(String token) {

        try {
            log.debug("Validating JWT token");

            Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token);

            log.debug("JWT token validation successful");

            return true;

        } catch (Exception e) {

            log.warn("JWT token validation failed: {}", e.getMessage());

            return false;
        }
    }

    public String extractRole(String token) {

        try {
            log.debug("Extracting role from JWT token");

            String role = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("role", String.class);

            log.debug("Role extracted successfully");

            return role;

        } catch (Exception e) {

            log.error("Failed to extract role from token: {}", e.getMessage(), e);

            throw e;
        }
    }

    public String extractUserEmail(String token) {

        try {
            log.debug("Extracting user email from JWT token");

            String email = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

            log.debug("User email extracted successfully");

            return email;

        } catch (Exception e) {

            log.error("Failed to extract user email from token: {}", e.getMessage(), e);

            throw e;
        }
    }
}