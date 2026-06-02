import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (username) => {

    const socket = new SockJS(
        "http://localhost:8080/ws"
    );

    stompClient = new Client({

        webSocketFactory: () => socket,

        reconnectDelay: 5000,

        onConnect: () => {

            console.log("Connected");

            stompClient.publish({
                destination: "/app/online",
                body: JSON.stringify({
                    sender: username
                })
            });
        }
    });

    stompClient.activate();
};

export const disconnectWebSocket = () => {

    if (stompClient) {
        stompClient.deactivate();
    }
};