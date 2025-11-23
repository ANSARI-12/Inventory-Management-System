import React, { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await registerUser({ username, password });
        alert("Registered! Please log in.");
        setIsRegister(false);
      } else {
        const res = await loginUser({ username, password });
        localStorage.setItem("token", res.data.token);
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Action failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isRegister ? "Register" : "Login"}</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn import-btn">
          {isRegister ? "Sign Up" : "Sign In"}
        </button>
        <p
          onClick={() => setIsRegister(!isRegister)}
          style={{ cursor: "pointer", marginTop: "10px", color: "blue" }}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </p>
      </form>
    </div>
  );
}
