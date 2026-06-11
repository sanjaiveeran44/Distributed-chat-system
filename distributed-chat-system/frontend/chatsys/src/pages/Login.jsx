import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await login({
                email,
                password
            });

            localStorage.setItem(
                "token",
                response.data.token
            );

            navigate("/chat");

        } catch (error) {
            alert("Invalid Credentials");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background:
                    "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    width: "400px",
                    padding: "40px",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                    color: "white",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                        fontSize: "2rem",
                    }}
                >
                    Welcome Back
                </h1>

                <form
                    onSubmit={handleLogin}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                    }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "1px solid #475569",
                            background: "#1e293b",
                            color: "white",
                            fontSize: "16px",
                            outline: "none",
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "1px solid #475569",
                            background: "#1e293b",
                            color: "white",
                            fontSize: "16px",
                            outline: "none",
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: "none",
                            background:
                                "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "0.3s",
                        }}
                    >
                        Login
                    </button>
                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                        color: "#cbd5e1",
                    }}
                >
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        style={{
                            color: "#60a5fa",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Register
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;