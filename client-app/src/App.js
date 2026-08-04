import { useState } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });
      setToken(response.data.token);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Medical Center Login</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label>Username</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {token && (
        <div style={{ marginTop: "20px", wordBreak: "break-all" }}>
          <strong>Login successful! Token:</strong>
          <p>{token}</p>
        </div>
      )}
    </div>
  );
}

export default App;
