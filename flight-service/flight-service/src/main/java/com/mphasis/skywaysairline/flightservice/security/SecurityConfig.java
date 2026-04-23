package com.mphasis.skywaysairline.flightservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

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

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // PUBLIC APIs
                        .requestMatchers(
                                "/api/flights/searchByName",
                                "/api/flights/searchByRoute",
                                "/api/flights/details/**",
                                "/api/flights/updateSeats/**",
                                "/api/flights/updateSeatsForDate/**",
                                "/api/flights/releaseSeatsForDate/**",
                                "/api/flights/completeJourney/**"
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
                "Public endpoints configured for search, details, and seat-sync APIs"
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

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin"));
                configuration.setExposedHeaders(Arrays.asList("Authorization"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}