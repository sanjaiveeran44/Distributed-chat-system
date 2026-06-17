import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (
    roomId,
    username,
    onMessageReceived
    ) => {

        const socket = new SockJS("http://localhost:8080/chat");

        stompClient = new Client({

            webSocketFactory: () => socket,

            reconnectDelay: 5000,

            connectHeaders: {

                Authorization:
                    `Bearer ${localStorage.getItem("token")}`

            },

            debug: (str) => {
                console.log(str);
            },

            onConnect: () => {

                console.log("========== CONNECTED ==========");

                stompClient.subscribe(
                    `/topic/${roomId}`,
                    (message) => {

                        console.log("MESSAGE FROM SERVER");
                        console.log(message.body);

                        onMessageReceived(
                            JSON.parse(message.body)
                        );
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

            },

            onStompError: (frame) => {

                console.log("STOMP ERROR");

                console.log(frame);

            }

        });

        stompClient.activate();

    };

export const sendMessage = (

    roomId,

    username,

    text

) => {

    if (!stompClient) {

        console.log("CLIENT IS NULL");

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

export const disconnectWebSocket = () => {

    if (stompClient) {

        stompClient.deactivate();

    }

};