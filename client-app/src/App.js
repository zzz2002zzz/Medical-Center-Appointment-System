import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "demo-key-123";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsError, setDoctorsError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });
      setToken(response.data.token);
      fetchDoctors();
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  const fetchDoctors = async () => {
    setDoctorsError("");
    try {
      const response = await axios.get("http://localhost:8080/doctors", {
        headers: { "X-API-KEY": API_KEY },
      });
      setDoctors(response.data);
    } catch (err) {
      setDoctorsError("Failed to load doctors.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Medical Center Login</h1>

      {!token && (
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
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {token && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ color: "green" }}><strong>Logged in successfully!</strong></p>

          <h2>Available Doctors</h2>
          {doctorsError && <p style={{ color: "red" }}>{doctorsError}</p>}
          {doctors.length === 0 && !doctorsError && <p>Loading doctors...</p>}

          <ul>
            {doctors.map((doc) => (
              <li key={doc.id} style={{ marginBottom: "10px", listStyle: "none", border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}>
                <strong>{doc.name}</strong><br />
                Specialization: {doc.specialization}<br />
                Availability: {doc.availability}<br />
                <small>ID: {doc.id}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
