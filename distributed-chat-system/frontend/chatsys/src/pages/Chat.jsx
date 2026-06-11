import { useEffect, useState } from "react";

import {

    getRooms,

    createRoom,

    joinRoom

} from "../services/RoomService";

function Chat() {

    const [rooms, setRooms] = useState([]);

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    useEffect(() => {

        loadRooms();

    }, []);

    const loadRooms = async () => {

        const response = await getRooms();

        setRooms(response.data);

    };

    const createNewRoom = async () => {

        if (!name.trim()) return;

        await createRoom({

            name,

            description,

            isPrivate: false

        });

        setName("");

        setDescription("");

        loadRooms();

    };

    const enterRoom = async (room) => {

        await joinRoom(room.id);

        setSelectedRoom(room);

    };

    return (

        <div

            style={{

                height: "100vh",

                display: "flex",

                background: "#0f172a",

                color: "white"

            }}

        >

            <div

                style={{

                    width: "320px",

                    borderRight: "1px solid #334155",

                    padding: "20px"

                }}

            >

                <h2>

                    Rooms

                </h2>

                <input

                    value={name}

                    placeholder="Room name"

                    onChange={(e) =>

                        setName(e.target.value)

                    }

                    style={{

                        width: "100%",

                        marginBottom: "10px",

                        padding: "10px"

                    }}

                />

                <input

                    value={description}

                    placeholder="Description"

                    onChange={(e) =>

                        setDescription(

                            e.target.value

                        )

                    }

                    style={{

                        width: "100%",

                        marginBottom: "10px",

                        padding: "10px"

                    }}

                />

                <button

                    onClick={createNewRoom}

                    style={{

                        width: "100%",

                        padding: "10px",

                        marginBottom: "20px"

                    }}

                >

                    Create Room

                </button>

                {

                    rooms.map(

                        room => (

                            <div

                                key={room.id}

                                onClick={() =>

                                    enterRoom(room)

                                }

                                style={{

                                    padding: "12px",

                                    marginBottom: "10px",

                                    cursor: "pointer",

                                    background:

                                        selectedRoom?.id === room.id

                                            ? "#2563eb"

                                            : "#1e293b",

                                    borderRadius: "8px"

                                }}

                            >

                                <strong>

                                    {room.name}

                                </strong>

                                <br />

                                <small>

                                    {room.description}

                                </small>

                            </div>

                        )

                    )

                }

            </div>

            <div

                style={{

                    flex: 1,

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    fontSize: "28px"

                }}

            >

                {

                    selectedRoom

                        ?

                        (

                            <div>

                                Joined

                                <br />

                                <h2>

                                    {selectedRoom.name}

                                </h2>

                            </div>

                        )

                        :

                        (

                            "Select a Room"

                        )

                }

            </div>

        </div>

    );

}

export default Chat;