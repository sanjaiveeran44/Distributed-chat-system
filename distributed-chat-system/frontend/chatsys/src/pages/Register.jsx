import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

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

            await register(formData);

            alert("Registration Successful");

            navigate("/login");

        } catch (err) {
            alert("Registration Failed");
        }
    };

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                />

                <button type="submit">
                    Register
                </button>

            </form>
        </div>
    );
}

export default Register;