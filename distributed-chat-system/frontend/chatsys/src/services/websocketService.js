import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let currentSubscription = null;
let connectionPromise = null;

export const initWebSocketConnection = () => {
    if (stompClient && stompClient.connected) {
        return Promise.resolve();
    }
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
        const socket = new SockJS("http://localhost/chat");

        stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log("========== CONNECTED ==========");
                resolve();
            },
            onStompError: (frame) => {
                console.log("STOMP ERROR");
                console.log(frame);
                reject(frame);
            },
            onWebSocketClose: () => {
                console.log("WS CLOSED");
            }
        });

        stompClient.activate();
    });

    return connectionPromise;
};

export const subscribeToRoom = async (roomId, username, onMessageReceived) => {
    try {
        await initWebSocketConnection();
    } catch (e) {
        console.error("Failed to connect WS", e);
        return;
    }

    if (!stompClient || !stompClient.connected) {
        console.error("STOMP client is not connected");
        return;
    }

    if (currentSubscription) {
        currentSubscription.unsubscribe();
        currentSubscription = null;
    }

    currentSubscription = stompClient.subscribe(
        `/topic/${roomId}`,
        (message) => {
            console.log("MESSAGE FROM SERVER");
            console.log(message.body);
            if (onMessageReceived) {
                onMessageReceived(JSON.parse(message.body));
            }
        }
    );

    stompClient.publish({
        destination: `/app/join/${roomId}`,
        body: JSON.stringify({
            sender: username,
            message: "",
            messageType: "JOIN"
        })
    });
};

export const sendMessage = (
    roomId,
    username,
    text
) => {
    if (!stompClient || !stompClient.connected) {
        console.log("CLIENT IS NULL OR NOT CONNECTED");
        return;
    }

    console.log("SENDING MESSAGE");

    stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({
            sender: username,
            message: text,
            messageType: "CHAT"
        })
    });
};

export const sendTyping = (roomId, username) => {
    if (!stompClient || !stompClient.connected) return;
    stompClient.publish({
        destination: `/app/typing/${roomId}`,
        body: JSON.stringify({
            sender: username,
            message: "",
            messageType: "TYPING"
        })
    });
};

export const disconnectWebSocket = () => {
    if (currentSubscription) {
        currentSubscription.unsubscribe();
        currentSubscription = null;
    }
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
    connectionPromise = null;
};