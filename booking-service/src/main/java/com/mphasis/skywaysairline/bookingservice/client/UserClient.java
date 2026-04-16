package com.mphasis.skywaysairline.bookingservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class UserClient {

    private static final Logger log =
            LoggerFactory.getLogger(UserClient.class);

    @Autowired
    private RestTemplate restTemplate;

    // ✅ Wallet Deduction
    @CircuitBreaker(
            name = "userService",
            fallbackMethod = "transferMoneyFallback"
    )
    public String transferMoney(
            String customerId,
            Double price) {

        String url =
                "http://localhost:8082/api/users/wallet"
                        + "?customerId=" + customerId
                        + "&price=" + price;

        try {

            log.info(
                    "Calling User Service for wallet deduction. CustomerId: {}, Amount: {}",
                    customerId,
                    price
            );

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.PUT,
                            null,
                            String.class
                    );

            log.info(
                    "Wallet deduction successful for CustomerId: {}",
                    customerId
            );

            return response.getBody();

        } catch (Exception e) {

            log.error(
                    "Wallet deduction failed for CustomerId: {}",
                    customerId,
                    e
            );

            throw e;
        }
    }

    // ✅ Wallet Top-up
    @CircuitBreaker(
            name = "userService",
            fallbackMethod = "addWalletMoneyFallback"
    )
    public String addWalletMoney(
            String userId,
            Double amount) {

        String url =
                "http://localhost:8082/api/users/wallet/add"
                        + "?userId=" + userId
                        + "&amount=" + amount;

        try {

            log.info(
                    "Calling User Service for wallet top-up. UserId: {}, Amount: {}",
                    userId,
                    amount
            );

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            null,
                            String.class
                    );

            log.info(
                    "Wallet top-up successful for UserId: {}",
                    userId
            );

            return response.getBody();

        } catch (Exception e) {

            log.error(
                    "Wallet top-up failed for UserId: {}",
                    userId,
                    e
            );

            throw e;
        }
    }

    // ✅ Get UserId
    @CircuitBreaker(
            name = "userService",
            fallbackMethod = "getUserIdFallback"
    )
    public String getUserIdByEmail(
            String email) {

        String url =
                "http://localhost:8082/api/users/id-by-email"
                        + "?email=" + email;

        try {

            log.info(
                    "Calling User Service to fetch userId by email: {}",
                    email
            );

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            String.class
                    );

            log.info(
                    "UserId fetched successfully for email: {}",
                    email
            );

            return response.getBody();

        } catch (Exception e) {

            log.error(
                    "Fetching userId failed for email: {}",
                    email,
                    e
            );

            throw e;
        }
    }

    // =====================================
    // FALLBACK METHODS
    // =====================================

    public String transferMoneyFallback(
            String customerId,
            Double price,
            Exception ex) {

        log.error(
                "Fallback triggered for wallet deduction. CustomerId: {}",
                customerId,
                ex
        );

        return "User Service unavailable for wallet deduction";
    }

    public String addWalletMoneyFallback(
            String userId,
            Double amount,
            Exception ex) {

        log.error(
                "Fallback triggered for wallet top-up. UserId: {}",
                userId,
                ex
        );

        return "User Service unavailable for wallet top-up";
    }

    public String getUserIdFallback(
            String email,
            Exception ex) {

        log.error(
                "Fallback triggered for getUserId. Email: {}",
                email,
                ex
        );

        return "SERVICE_UNAVAILABLE";
    }
}