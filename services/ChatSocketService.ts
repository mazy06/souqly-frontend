import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

// Utilise uniquement la variable d'environnement EXPO_PUBLIC_DEV_API_URL
const WS_BASE_URL = process.env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:8080';
const WS_ENDPOINT = WS_BASE_URL.replace(/\/$/, '') + '/ws';

export function connectChatSocket(jwtToken: string, conversationId: string, onMessage: (msg: any) => void) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_ENDPOINT),
    connectHeaders: {
      Authorization: `Bearer ${jwtToken}`,
    },
    debug: (str) => {
      console.log('[STOMP]', str);
    },
    reconnectDelay: 5000,
    onStompError: (frame) => {
      console.error('Erreur STOMP', frame);
    },
  });

  stompClient.onConnect = () => {
    console.log('Connecté au WebSocket !');
    // S'abonner à la conversation
    stompClient?.subscribe(`/topic/conversations/${conversationId}`, (message: IMessage) => {
      const chatMessage = JSON.parse(message.body);
      onMessage(chatMessage);
    });
  };

  stompClient.activate();
}

export function sendChatMessage(conversationId: string, message: any) {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chat/${conversationId}/send`,
      body: JSON.stringify(message),
    });
  }
}

export function disconnectChatSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
} 