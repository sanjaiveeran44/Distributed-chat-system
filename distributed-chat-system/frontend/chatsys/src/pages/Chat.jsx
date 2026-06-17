import { useEffect, useState } from "react";

import {

    getRooms,

    joinRoom

} from "../services/RoomService";

import {

    connectWebSocket,

    sendMessage,

    disconnectWebSocket

} from "../services/websocketService";

function Chat() {

    const username = localStorage.getItem("email");

    const [rooms, setRooms] = useState([]);

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [messages, setMessages] = useState([]);

    const [text, setText] = useState("");

    useEffect(() => {

        loadRooms();

        return () => {

            disconnectWebSocket();

        };

    }, []);

    const loadRooms = async () => {

        const response = await getRooms();

        setRooms(response.data);

    };

    const enterRoom = async (room) => {

        await joinRoom(room.id);

        disconnectWebSocket();

        setMessages([]);

        connectWebSocket(

            room.id,

            username,

            (message) => {

                setMessages((previous) => [

                    ...previous,

                    message

                ]);

            }

        );

        setSelectedRoom(room);

    };

    const send = () => {

        if (!text.trim()) return;

        sendMessage(
            selectedRoom.id,
            username,
            text
        );
        setText("");
    };

    return (

        <div

            style={{

                display: "flex",

                height: "100vh",

                background: "#0f172a",

                color: "white"

            }}

        >

            <div

                style={{

                    width: "280px",

                    borderRight: "1px solid #334155",

                    padding: "20px"

                }}

            >

                <h2>

                    Rooms

                </h2>

                {

                    rooms.map(

                        room => (

                            <div

                                key={room.id}

                                onClick={() =>

                                    enterRoom(room)

                                }

                                style={{

                                    padding: "15px",

                                    marginBottom: "10px",

                                    cursor: "pointer",

                                    background:

                                        selectedRoom?.id === room.id

                                            ? "#2563eb"

                                            : "#1e293b",

                                    borderRadius: "10px"

                                }}

                            >

                                {room.name}

                            </div>

                        )

                    )

                }

            </div>

            <div

                style={{

                    flex: 1,

                    display: "flex",

                    flexDirection: "column"

                }}

            >

                <div

                    style={{

                        padding: "20px",

                        borderBottom: "1px solid #334155"

                    }}

                >

                    {

                        selectedRoom

                            ?

                            selectedRoom.name

                            :

                            "Select Room"

                    }

                </div>

                <div

                    style={{

                        flex: 1,

                        overflowY: "auto",

                        padding: "20px"

                    }}

                >

                    {

                        messages.map(

                            (msg, index) => (

                                <div

                                    key={index}

                                    style={{

                                        marginBottom: "15px"

                                    }}

                                >

                                    <strong>

                                        {

                                            msg.sender

                                        }

                                    </strong>

                                    <br/>

                                    {

                                        msg.message

                                    }

                                </div>

                            )

                        )

                    }

                </div>

                {

                    selectedRoom &&

                    <div

                        style={{

                            display: "flex",

                            padding: "20px",

                            gap: "10px"

                        }}

                    >

                        <input

                            value={text}

                            onChange={(e) =>

                                setText(

                                    e.target.value

                                )

                            }

                            style={{

                                flex: 1,

                                padding: "15px"

                            }}

                        />

                        <button

                            onClick={send}

                        >

                            Send

                        </button>

                    </div>

                }

            </div>

        </div>

    );

}

export default Chat;