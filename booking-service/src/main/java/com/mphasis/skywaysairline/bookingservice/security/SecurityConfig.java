package com.mphasis.skywaysairline.bookingservice.security;

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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        log.info("Initializing Spring Security configuration");

        http.csrf(csrf -> {
                    log.debug("CSRF disabled");
                    csrf.disable();
                })
                .cors(cors -> {
                    log.debug("CORS enabled with default settings");
                })
                .authorizeHttpRequests(auth -> auth

                        // 🔥 BOOKING API (TEMP PUBLIC FOR TESTING)
                        .requestMatchers("/api/booking/**").permitAll()

                        .anyRequest().authenticated()
                );

        log.info("Public endpoints configured: /api/booking/**");
        log.info("All other endpoints require authentication");

        http.addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        log.info("JWT Filter added before UsernamePasswordAuthenticationFilter");
        log.info("Spring Security configuration completed");

        return http.build();
    }
}