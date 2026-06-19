import { useEffect, useState, useRef } from "react";
import { getRooms, joinRoom, getRoomMessages, createRoom } from "../services/RoomService";
import { connectWebSocket, sendMessage, sendTyping, disconnectWebSocket } from "../services/websocketService";

function Chat() {
    const username = localStorage.getItem("email") || "Guest";
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
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
    }, [messages, typingUsers]);

    const loadRooms = async () => {
        try {
            const response = await getRooms();
            setRooms(response.data);
        } catch (error) {
            console.error("Failed to load rooms", error);
        }
    };

    const handleCreateRoom = async () => {
        const roomName = prompt("Enter room name:");
        if (!roomName) return;
        const desc = prompt("Enter room description (optional):") || "";
        try {
            await createRoom({ name: roomName, description: desc, isPrivate: false });
            loadRooms();
        } catch (error) {
            alert("Failed to create room");
        }
    };

    const enterRoom = async (room) => {
        try {
            await joinRoom(room.id);
            disconnectWebSocket();
            setTypingUsers({});
            setOnlineUsers(new Set([username]));
            
            // Load existing messages
            const response = await getRoomMessages(room.id);
            setMessages(response.data);

            connectWebSocket(
                room.id,
                username,
                (message) => {
                    if (message.messageType === "TYPING") {
                        if (message.sender !== username) {
                            setTypingUsers(prev => ({ ...prev, [message.sender]: Date.now() }));
                            setOnlineUsers(prev => new Set(prev).add(message.sender));
                        }
                    } else if (message.messageType === "JOIN") {
                        setMessages((previous) => [...previous, message]);
                        setOnlineUsers(prev => new Set(prev).add(message.sender));
                    } else if (message.messageType === "LEAVE") {
                        setMessages((previous) => [...previous, message]);
                        setOnlineUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(message.sender);
                            return newSet;
                        });
                    } else {
                        // Regular chat message
                        setMessages((previous) => [...previous, message]);
                        setOnlineUsers(prev => new Set(prev).add(message.sender));
                        if (message.sender !== username) {
                            setTypingUsers(prev => {
                                const newTyping = { ...prev };
                                delete newTyping[message.sender];
                                return newTyping;
                            });
                        }
                    }
                }
            );

            setSelectedRoom(room);
        } catch (error) {
            console.error("Failed to enter room", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTypingUsers(prev => {
                const newTyping = { ...prev };
                let changed = false;
                for (const user in newTyping) {
                    if (now - newTyping[user] > 3000) {
                        delete newTyping[user];
                        changed = true;
                    }
                }
                return changed ? newTyping : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const send = () => {
        if (!text.trim()) return;
        sendMessage(selectedRoom.id, username, text);
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            send();
        } else {
            sendTyping(selectedRoom.id, username);
        }
    };

    const activeTypers = Object.keys(typingUsers);

    return (
        <div style={{ display: "flex", height: "100vh", background: "#f0f4f8", color: "#1e293b", fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <div style={{ width: "320px", background: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", boxShadow: "2px 0 8px rgba(0,0,0,0.05)", zIndex: 10 }}>
                <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>Chats</h2>
                        <button 
                            onClick={handleCreateRoom}
                            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "background 0.2s" }}
                            onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                            onMouseLeave={(e) => e.target.style.background = "#2563eb"}
                        >
                            + New
                        </button>
                    </div>
                    <p style={{ margin: "0", fontSize: "14px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                        {username}
                    </p>
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
                                background: selectedRoom?.id === room.id ? "#eff6ff" : "#ffffff",
                                border: selectedRoom?.id === room.id ? "1px solid #bfdbfe" : "1px solid transparent",
                                borderRadius: "12px",
                                transition: "all 0.2s ease",
                                boxShadow: selectedRoom?.id === room.id ? "0 4px 12px rgba(37, 99, 235, 0.1)" : "none",
                            }}
                            onMouseEnter={(e) => { if (selectedRoom?.id !== room.id) e.currentTarget.style.background = "#f8fafc"; }}
                            onMouseLeave={(e) => { if (selectedRoom?.id !== room.id) e.currentTarget.style.background = "#ffffff"; }}
                        >
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: selectedRoom?.id === room.id ? "#1e40af" : "#1e293b" }}>{room.name}</h3>
                            {room.description && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>{room.description}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: "20px 32px", borderBottom: "1px solid #e2e8f0", background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>{selectedRoom.name}</h2>
                                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                                    {onlineUsers.size} Online
                                </p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            {messages.map((msg, index) => {
                                if (msg.messageType === "JOIN" || msg.messageType === "LEAVE") {
                                    return (
                                        <div key={index} style={{ textAlign: "center", margin: "8px 0" }}>
                                            <span style={{ background: "#e2e8f0", color: "#475569", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}>
                                                {msg.sender} {msg.messageType === "JOIN" ? "joined the room" : "left the room"}
                                            </span>
                                        </div>
                                    );
                                }

                                const isMe = msg.sender === username;
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", animation: "fadeIn 0.3s ease" }}>
                                        <div style={{
                                            maxWidth: "70%",
                                            background: isMe ? "#2563eb" : "#ffffff",
                                            color: isMe ? "#ffffff" : "#1e293b",
                                            padding: "12px 16px",
                                            borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                            display: "flex",
                                            flexDirection: "column",
                                            border: isMe ? "none" : "1px solid #e2e8f0"
                                        }}>
                                            {!isMe && (
                                                <span style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                                                    {msg.sender}
                                                </span>
                                            )}
                                            <span style={{ fontSize: "15px", lineHeight: "1.5" }}>{msg.message}</span>
                                            {msg.timestamp && (
                                                <span style={{ fontSize: "11px", color: isMe ? "#bfdbfe" : "#94a3b8", alignSelf: "flex-end", marginTop: "6px" }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {activeTypers.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeIn 0.3s ease" }}>
                                    <div style={{ background: "#e2e8f0", color: "#475569", padding: "8px 16px", borderRadius: "16px", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span>{activeTypers.join(", ")} {activeTypers.length === 1 ? "is" : "are"} typing</span>
                                        <span style={{ display: "inline-flex", gap: "2px" }}>
                                            <span style={{ width: "4px", height: "4px", background: "#64748b", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }}></span>
                                            <span style={{ width: "4px", height: "4px", background: "#64748b", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }}></span>
                                            <span style={{ width: "4px", height: "4px", background: "#64748b", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }}></span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: "20px 32px", borderTop: "1px solid #e2e8f0", background: "#ffffff" }}>
                            <div style={{ display: "flex", gap: "16px", background: "#f8fafc", borderRadius: "24px", padding: "8px 16px", border: "1px solid #e2e8f0", alignItems: "center", transition: "border-color 0.2s" }}>
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
                                        color: "#0f172a",
                                        fontSize: "15px",
                                        outline: "none"
                                    }}
                                />
                                <button
                                    onClick={send}
                                    style={{
                                        background: text.trim() ? "#2563eb" : "#cbd5e1",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: text.trim() ? "pointer" : "default",
                                        transition: "all 0.2s ease",
                                        boxShadow: text.trim() ? "0 2px 8px rgba(37, 99, 235, 0.4)" : "none"
                                    }}
                                    disabled={!text.trim()}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", background: "#f8fafc" }}>
                        <div style={{ width: "80px", height: "80px", background: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <h2 style={{ margin: 0, fontSize: "24px", color: "#0f172a", fontWeight: "600" }}>Welcome to ChatSys</h2>
                        <p style={{ marginTop: "8px", fontSize: "15px" }}>Select a room from the sidebar to start chatting</p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

export default Chat;