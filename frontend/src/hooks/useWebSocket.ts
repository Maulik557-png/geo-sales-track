import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CheckpointWebSocketMessage, LocationWebSocketMessage } from '../types/journey';

interface UseWebSocketOptions {
  onLocationUpdate?: (data: LocationWebSocketMessage) => void;
  onCheckpointUpdate?: (data: CheckpointWebSocketMessage) => void;
  autoConnect?: boolean;
}

export const useWebSocket = ({
  onLocationUpdate,
  onCheckpointUpdate,
  autoConnect = true,
}: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const stompClientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (stompClientRef.current && stompClientRef.current.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP Debug]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log('Connected to STOMP WebSocket endpoint /ws');

      // Subscribe to location updates
      client.subscribe('/topic/location', (message) => {
        try {
          const payload: LocationWebSocketMessage = JSON.parse(message.body);
          if (onLocationUpdate) {
            onLocationUpdate(payload);
          }
        } catch (err) {
          console.error('Error parsing location WebSocket payload', err);
        }
      });

      // Subscribe to checkpoint updates
      client.subscribe('/topic/checkpoint', (message) => {
        try {
          const payload: CheckpointWebSocketMessage = JSON.parse(message.body);
          if (onCheckpointUpdate) {
            onCheckpointUpdate(payload);
          }
        } catch (err) {
          console.error('Error parsing checkpoint WebSocket payload', err);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from STOMP WebSocket');
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      setIsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;
  }, [onLocationUpdate, onCheckpointUpdate]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
};
