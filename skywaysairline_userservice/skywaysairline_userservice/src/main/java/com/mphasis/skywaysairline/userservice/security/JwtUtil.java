package com.mphasis.skywaysairline.userservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

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

    public String generateToken(
            String email,
            String role) {

        log.info(
                "Generating JWT token for email: {}, role: {}",
                email,
                role
        );

        String token = Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000 * 60 * 60
                        )
                )
                .signWith(
                        getKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();

        log.info(
                "JWT token generated successfully for email: {}",
                email
        );

        return token;
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

        } catch (UnsupportedJwtException e) {

            log.warn(
                    "Unsupported JWT token: {}",
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

        } catch (IllegalArgumentException e) {

            log.warn(
                    "JWT token is empty or invalid: {}",
                    e.getMessage()
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
                    "Extracting role from JWT token"
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
                    "Failed to extract role from token: {}",
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
                    "Extracting email from JWT token"
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
                    "Failed to extract email from token: {}",
                    e.getMessage(),
                    e
            );

            throw e;
        }
    }
}