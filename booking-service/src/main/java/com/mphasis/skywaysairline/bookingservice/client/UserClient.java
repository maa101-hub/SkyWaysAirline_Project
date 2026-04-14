package com.mphasis.skywaysairline.bookingservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserClient {

    @Autowired
    private RestTemplate restTemplate;

    public String transferMoney(String customerId, Double price) {

        String url = "http://localhost:8082/api/users/wallet"
                + "?customerId=" + customerId   // ✅ FIXED
                + "&price=" + price;

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.PUT,
                null,
                String.class
        );

        return response.getBody();
    }
}