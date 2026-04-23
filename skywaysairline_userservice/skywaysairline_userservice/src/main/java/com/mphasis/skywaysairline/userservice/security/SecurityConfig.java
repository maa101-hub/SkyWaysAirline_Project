package com.mphasis.skywaysairline.userservice.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private static final Logger log =
            LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {

        log.info("Initializing BCrypt PasswordEncoder");

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {

        log.info("Initializing Spring Security configuration");

        http.csrf(csrf -> {
                    log.debug("CSRF disabled");
                    csrf.disable();
                })

                .cors(cors -> {
                    log.debug("CORS enabled");
                })

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/all",
                                "/api/users/delete/**",
                                "/api/users/**",
                                "/api/users/wallet",
                                "/api/users/id-by-email",
                                "/api/users/wallet/add",
                                "/api/users/admin/notifications/**",
                                "/ws-notifications/**"
                        ).permitAll()

                        .requestMatchers("/api/users/**")
                        .authenticated()

                        .requestMatchers("/api/users/test")
                        .authenticated()

                        // Protected APIs
                        .anyRequest()
                        .authenticated()
                );

        log.info("Public endpoints configured");
        log.info("Protected endpoints require JWT authentication");

        http.addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        log.info("JWT Filter added before UsernamePasswordAuthenticationFilter");
        log.info("Spring Security configuration completed");

        return http.build();
    }
}