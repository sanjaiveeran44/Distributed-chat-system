import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import axios from "axios";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await axios.post(
            "http://localhost:8080/api/auth/register",
            formData
        );

        console.log("Registration Successful");
        alert("Registration Successful");
        navigate("/login");
    } catch (err) {
        console.log("Registration Failed");
        alert("Registration Failed");
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
                    Create Account
                </h1>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                    }}
                >
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
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
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
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
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
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
                        Register
                    </button>
                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                        color: "#cbd5e1",
                    }}
                >
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        style={{
                            color: "#60a5fa",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;