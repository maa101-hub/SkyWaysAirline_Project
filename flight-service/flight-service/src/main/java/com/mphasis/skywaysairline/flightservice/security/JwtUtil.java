package com.mphasis.skywaysairline.flightservice.security;

import java.security.Key;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private static final Logger log =
            LoggerFactory.getLogger(JwtUtil.class);

    private final String SECRET =
            "myverystrongsecretkeythatismorethan32characterslong";

    private Key getKey() {
        return Keys.hmacShaKeyFor(
                SECRET.getBytes()
        );
    }

    public boolean validateToken(
            String token) {

        try {

            log.debug("Validating JWT token");

            Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token);

            log.debug(
                    "JWT token validation successful"
            );

            return true;

        } catch (ExpiredJwtException e) {

            log.warn(
                    "JWT token expired: {}",
                    e.getMessage()
            );

        } catch (MalformedJwtException e) {

            log.warn(
                    "Malformed JWT token: {}",
                    e.getMessage()
            );

        } catch (SignatureException e) {

            log.warn(
                    "Invalid JWT signature: {}",
                    e.getMessage()
            );

        } catch (UnsupportedJwtException e) {

            log.warn(
                    "Unsupported JWT token: {}",
                    e.getMessage()
            );

        } catch (IllegalArgumentException e) {

            log.warn(
                    "JWT token is empty or invalid"
            );

        } catch (Exception e) {

            log.error(
                    "JWT validation failed: {}",
                    e.getMessage(),
                    e
            );
        }

        return false;
    }

    public String extractRole(
            String token) {

        try {

            log.debug(
                    "Extracting role from token"
            );

            String role =
                    Jwts.parserBuilder()
                            .setSigningKey(getKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody()
                            .get("role", String.class);

            log.debug(
                    "Role extracted successfully"
            );

            return role;

        } catch (Exception e) {

            log.error(
                    "Failed to extract role: {}",
                    e.getMessage(),
                    e
            );

            throw e;
        }
    }

    public String extractUserEmail(
            String token) {

        try {

            log.debug(
                    "Extracting email from token"
            );

            String email =
                    Jwts.parserBuilder()
                            .setSigningKey(getKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody()
                            .getSubject();

            log.debug(
                    "Email extracted successfully"
            );

            return email;

        } catch (Exception e) {

            log.error(
                    "Failed to extract email: {}",
                    e.getMessage(),
                    e
            );

            throw e;
        }
    }
}