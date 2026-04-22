package com.mphasis.skywaysairline.userservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.userservice.dto.AdminNotificationMessage;

@Service
public class AdminNotificationPublisher {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final SimpMessagingTemplate messagingTemplate;

    public AdminNotificationPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishDeleteRequest(
            String userId,
            String name,
            String email,
            String reason
    ) {
        AdminNotificationMessage message = new AdminNotificationMessage();
        message.setType("DELETE_REQUEST");
        message.setReqId("REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        message.setUserId(userId);
        message.setName(name);
        message.setEmail(email);
        message.setReason(reason);
        message.setRequestedAt(LocalDateTime.now().format(FORMATTER));

        messagingTemplate.convertAndSend("/topic/admin/notifications", message);
    }

    public void publishUserDeleted(
            String userId,
            String name
    ) {
        AdminNotificationMessage message = new AdminNotificationMessage();
        message.setType("USER_DELETED");
        message.setReqId("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        message.setUserId(userId);
        message.setName(name);
        message.setRequestedAt(LocalDateTime.now().format(FORMATTER));

        messagingTemplate.convertAndSend("/topic/admin/notifications", message);
    }
}
