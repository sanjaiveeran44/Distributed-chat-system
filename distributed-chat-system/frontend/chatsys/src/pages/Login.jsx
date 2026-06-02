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
        <div>

            <h1>Login</h1>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;