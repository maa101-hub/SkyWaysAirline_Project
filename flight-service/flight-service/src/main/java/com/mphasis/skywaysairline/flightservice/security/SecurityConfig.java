package com.mphasis.skywaysairline.flightservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger log =
            LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {

        log.info(
                "Initializing Flight Service Security Configuration"
        );

        http.csrf(csrf -> {

                    log.debug("CSRF disabled");

                    csrf.disable();
                })

                .cors(cors -> {

                    log.debug("CORS enabled");
                })

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC APIs
                        .requestMatchers(
                                "/api/flights/searchByName",
                                "/api/flights/searchByRoute",
                                "/api/flights/details/**",
                                "/api/flights/updateSeats/**"
                        ).permitAll()

                        // ADMIN ONLY
                        .requestMatchers(
                                "/api/flights/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/routes/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/schedules/**"
                        ).hasRole("ADMIN")

                        .anyRequest()
                        .authenticated()
                );

        log.info(
                "Public endpoints configured for search and details APIs"
        );

        log.info(
                "Admin role required for Flights, Routes, Schedules APIs"
        );

        http.addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        log.info(
                "JWT Filter added before UsernamePasswordAuthenticationFilter"
        );

        log.info(
                "Flight Service Security Configuration completed"
        );

        return http.build();
    }
}