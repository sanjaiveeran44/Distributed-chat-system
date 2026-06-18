import { useEffect, useState, useRef } from "react";
import { getRooms, joinRoom, getRoomMessages } from "../services/RoomService";
import { connectWebSocket, sendMessage, disconnectWebSocket } from "../services/websocketService";

function Chat() {
    const username = localStorage.getItem("email");
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadRooms();
        return () => {
            disconnectWebSocket();
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadRooms = async () => {
        try {
            const response = await getRooms();
            setRooms(response.data);
        } catch (error) {
            console.error("Failed to load rooms", error);
        }
    };

    const enterRoom = async (room) => {
        try {
            await joinRoom(room.id);
            disconnectWebSocket();
            
            // Load existing messages
            const response = await getRoomMessages(room.id);
            setMessages(response.data);

            connectWebSocket(
                room.id,
                username,
                (message) => {
                    setMessages((previous) => [...previous, message]);
                }
            );

            setSelectedRoom(room);
        } catch (error) {
            console.error("Failed to enter room", error);
        }
    };

    const send = () => {
        if (!text.trim()) return;
        sendMessage(selectedRoom.id, username, text);
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            send();
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <div style={{ width: "320px", background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "24px", borderBottom: "1px solid #334155" }}>
                    <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#38bdf8" }}>Chat Rooms</h2>
                    <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#94a3b8" }}>Logged in as <strong style={{ color: "#e2e8f0" }}>{username}</strong></p>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                    {rooms.map(room => (
                        <div
                            key={room.id}
                            onClick={() => enterRoom(room)}
                            style={{
                                padding: "16px",
                                marginBottom: "12px",
                                cursor: "pointer",
                                background: selectedRoom?.id === room.id ? "#2563eb" : "#334155",
                                borderRadius: "12px",
                                transition: "background 0.2s ease",
                                boxShadow: selectedRoom?.id === room.id ? "0 4px 14px 0 rgba(37, 99, 235, 0.39)" : "none",
                            }}
                            onMouseEnter={(e) => { if (selectedRoom?.id !== room.id) e.currentTarget.style.background = "#475569"; }}
                            onMouseLeave={(e) => { if (selectedRoom?.id !== room.id) e.currentTarget.style.background = "#334155"; }}
                        >
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "500", color: "#f8fafc" }}>{room.name}</h3>
                            {room.description && <p style={{ margin: "4px 0 0", fontSize: "13px", color: selectedRoom?.id === room.id ? "#bfdbfe" : "#94a3b8" }}>{room.description}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0f172a" }}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: "20px 32px", borderBottom: "1px solid #334155", background: "#1e293b", display: "flex", alignItems: "center" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>{selectedRoom.name}</h2>
                                {selectedRoom.description && <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#94a3b8" }}>{selectedRoom.description}</p>}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === username;
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                                        <div style={{
                                            maxWidth: "70%",
                                            background: isMe ? "#3b82f6" : "#334155",
                                            color: isMe ? "#ffffff" : "#f8fafc",
                                            padding: "12px 16px",
                                            borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            display: "flex",
                                            flexDirection: "column"
                                        }}>
                                            {!isMe && (
                                                <span style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>
                                                    {msg.sender}
                                                </span>
                                            )}
                                            <span style={{ fontSize: "15px", lineHeight: "1.4" }}>{msg.message}</span>
                                            {msg.timestamp && (
                                                <span style={{ fontSize: "11px", color: isMe ? "#bfdbfe" : "#94a3b8", alignSelf: "flex-end", marginTop: "6px" }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: "24px 32px", borderTop: "1px solid #334155", background: "#1e293b" }}>
                            <div style={{ display: "flex", gap: "16px", background: "#0f172a", borderRadius: "24px", padding: "8px 16px", border: "1px solid #334155", alignItems: "center" }}>
                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    style={{
                                        flex: 1,
                                        padding: "12px 8px",
                                        background: "transparent",
                                        border: "none",
                                        color: "white",
                                        fontSize: "15px",
                                        outline: "none"
                                    }}
                                />
                                <button
                                    onClick={send}
                                    style={{
                                        background: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: text.trim() ? "pointer" : "not-allowed",
                                        opacity: text.trim() ? 1 : 0.6,
                                        transition: "background 0.2s"
                                    }}
                                    disabled={!text.trim()}
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "18px" }}>
                        Select a room to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;