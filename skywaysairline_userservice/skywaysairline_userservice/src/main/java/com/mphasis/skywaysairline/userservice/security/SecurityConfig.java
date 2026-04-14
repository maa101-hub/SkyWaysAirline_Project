package com.mphasis.skywaysairline.userservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
              .cors(cors -> {}) 
             .authorizeHttpRequests(auth -> auth

                // Public APIs
                .requestMatchers("/api/users/register", "/api/users/login","/api/users/all","/api/users/delete/**","/api/users/**","/api/users/wallet").permitAll()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/users/test").authenticated()
                
                // Protected APIs
                .anyRequest().authenticated()
            );

        // 🔥 Add JWT Filter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}