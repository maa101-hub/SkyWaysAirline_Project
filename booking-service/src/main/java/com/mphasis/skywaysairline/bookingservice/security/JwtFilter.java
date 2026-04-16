package com.mphasis.skywaysairline.bookingservice.security;

import java.io.IOException;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        log.debug("JWT Filter invoked for {} {}", method, uri);

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            log.debug("Authorization header found");

            String token = authHeader.substring(7);

            try {

                if (jwtUtil.validateToken(token)) {

                    log.debug("JWT token validated successfully");

                    String email = jwtUtil.extractUserEmail(token);
                    String role = jwtUtil.extractRole(token);

                    String finalRole =
                            role.equals("A") ? "ADMIN" : "CUSTOMER";

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    Collections.singleton(
                                            () -> "ROLE_" + finalRole
                                    )
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(auth);

                    log.info(
                            "User authenticated successfully. Email: {}, Role: {}",
                            email,
                            finalRole
                    );

                } else {

                    log.warn("Invalid JWT token for request URI: {}", uri);
                }

            } catch (Exception e) {

                log.error(
                        "JWT authentication failed for URI: {} , Reason: {}",
                        uri,
                        e.getMessage(),
                        e
                );
            }

        } else {

            log.debug("Authorization header missing or invalid for URI: {}", uri);
        }

        filterChain.doFilter(request, response);
    }
}