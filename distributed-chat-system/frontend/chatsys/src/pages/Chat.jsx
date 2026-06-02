import { useEffect } from "react";
import { connectWebSocket } from "../services/websocketService";

function Chat() {

    useEffect(() => {

        connectWebSocket("Sanjay");

    }, []);

    return (
        <div>
            <h1>Chat Room</h1>
        </div>
    );
}

export default Chat;