package com.mphasis.skywaysairline.flightservice.security;

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

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
             .cors(cors->{})
            .authorizeHttpRequests(auth -> auth

                // PUBLIC APIs
                .requestMatchers("/api/flights/searchByName", "/api/flights/searchByRoute","/api/flights/details/**","/api/flights/updateSeats/**").permitAll()

                // ADMIN ONLY
                .requestMatchers("/api/flights/**").hasRole("ADMIN")
                .requestMatchers("/api/routes/**").hasRole("ADMIN")
                .requestMatchers("/api/schedules/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}