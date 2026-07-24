package com.salestrack.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.salestrack.dto.response.LocationWebSocketMessage;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishLocationUpdate(LocationWebSocketMessage message) {
        log.info("Broadcasting location update for journey {}: {}", message.getJourneyId(), message);
        messagingTemplate.convertAndSend("/topic/location", message);
    }

    public void publishCheckpointUpdate(com.salestrack.dto.response.CheckpointWebSocketMessage message) {
        log.info("Broadcasting checkpoint update for journey {}: {}", message.getJourneyId(), message);
        messagingTemplate.convertAndSend("/topic/checkpoint", message);
    }
}
