import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_KEY = "demo-key-123";

function initials(name) {
  if (!name) return "?";
  return name.replace(/^Dr\.?\s*/i, "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("doctors");

  const [doctors, setDoctors] = useState([]);
  const [doctorsError, setDoctorsError] = useState("");
  const [specializationQuery, setSpecializationQuery] = useState("");

  const [patientForm, setPatientForm] = useState({ name: "", dob: "", contact: "", medicalHistorySummary: "" });
  const [patientResult, setPatientResult] = useState(null);
  const [patientError, setPatientError] = useState("");

  const [appointmentForm, setAppointmentForm] = useState({ patientId: "", doctorId: "", dateTime: "" });
  const [appointmentResult, setAppointmentResult] = useState(null);
  const [appointmentError, setAppointmentError] = useState("");

  const authHeaders = (jwt) => ({
    "X-API-KEY": API_KEY,
    Authorization: `Bearer ${jwt}`,
  });

  const fetchDoctors = async (jwt) => {
    setDoctorsError("");
    try {
      const response = await axios.get("http://localhost:8080/doctors", {
        headers: authHeaders(jwt),
      });
      setDoctors(response.data);
    } catch (err) {
      setDoctorsError("Couldn't load the doctor list. Try refreshing.");
    }
  };

  const searchDoctors = async (e) => {
    e.preventDefault();
    setDoctorsError("");
    if (!specializationQuery.trim()) {
      fetchDoctors(token);
      return;
    }
    try {
      const response = await axios.get("http://localhost:8080/doctors/search", {
        headers: authHeaders(token),
        params: { specialization: specializationQuery },
      });
      setDoctors(response.data);
    } catch (err) {
      setDoctorsError("Search failed. Try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:8080/auth/login", { username, password });
      const jwt = response.data.token;
      setToken(jwt);
      fetchDoctors(jwt);
    } catch (err) {
      setError("Login failed. Check the username and password and try again.");
    }
  };

  const handleSignOut = () => {
    setToken("");
    setUsername("");
    setPassword("");
    setTab("doctors");
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setPatientError("");
    setPatientResult(null);
    try {
      const response = await axios.post("http://localhost:8080/patients/register", patientForm, {
        headers: authHeaders(token),
      });
      setPatientResult(response.data);
      setAppointmentForm((prev) => ({ ...prev, patientId: response.data.id }));
    } catch (err) {
      setPatientError("Couldn't register this patient. Check the fields and try again.");
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setAppointmentError("");
    setAppointmentResult(null);
    try {
      const response = await axios.post("http://localhost:8080/appointments/book", appointmentForm, {
        headers: authHeaders(token),
      });
      setAppointmentResult(response.data);
    } catch (err) {
      const msg = err.response?.data;
      setAppointmentError(typeof msg === "string" && msg ? msg : "Couldn't book this appointment. Check the patient, doctor, and time.");
    }
  };

  const goBookWithDoctor = (doctorId) => {
    setAppointmentForm((prev) => ({ ...prev, doctorId }));
    setTab("book");
  };

  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="brand">Medical Center</div>
          <p className="tagline">Front desk â€” sign in to continue</p>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Sign in</button>
          </form>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <div className="brand">Medical Center</div>
        <div className="right">
          <span>{username || "Front desk"}</span>
          <button className="signout" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="tabbar">
        <button className={`tab ${tab === "doctors" ? "active" : ""}`} onClick={() => setTab("doctors")}>Doctors</button>
        <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register patient</button>
        <button className={`tab ${tab === "book" ? "active" : ""}`} onClick={() => setTab("book")}>Book appointment</button>
      </div>

      <div className="content">
        {tab === "doctors" && (
          <>
            <h2>Available doctors</h2>
            <p className="section-sub">Browse doctors on file and book directly from a card.</p>
            <form onSubmit={searchDoctors} style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              <input
                type="text"
                placeholder="Search by specialization (e.g. Cardiology)"
                value={specializationQuery}
                onChange={(e) => setSpecializationQuery(e.target.value)}
                style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "6px", fontFamily: "'IBM Plex Sans', sans-serif" }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn" style={{ background: "var(--line)", color: "var(--ink)" }} onClick={() => { setSpecializationQuery(""); fetchDoctors(token); }}>Clear</button>
            </form>
            {doctorsError && <p className="error-text">{doctorsError}</p>}
            {doctors.length === 0 && !doctorsError && <p className="empty-note">No doctors match.</p>}
            <div className="card-grid">
              {doctors.map((doc) => (
                <div className="doctor-card" key={doc.id}>
                  <div className="avatar">{initials(doc.name)}</div>
                  <h3>{doc.name}</h3>
                  <span className="badge">{doc.specialization}</span>
                  <div className="slots">
                    {doc.availabilitySlots && doc.availabilitySlots.length > 0
                      ? doc.availabilitySlots.join(" Â· ")
                      : "No slots listed"}
                  </div>
                  <div className="record-id">{doc.id}</div>
                  <button className="book-btn" onClick={() => goBookWithDoctor(doc.id)}>Book with this doctor</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "register" && (
          <>
            <h2>Register patient</h2>
            <p className="section-sub">Add a new patient record to the system.</p>
            <div className="panel">
              <form onSubmit={handleRegisterPatient}>
                <div className="form-row">
                  <div className="field">
                    <label>Name</label>
                    <input type="text" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Date of birth</label>
                    <input type="date" value={patientForm.dob} onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })} />
                  </div>
                </div>
                <div className="field">
                  <label>Contact</label>
                  <input type="text" value={patientForm.contact} onChange={(e) => setPatientForm({ ...patientForm, contact: e.target.value })} />
                </div>
                <div className="field">
                  <label>Medical history summary</label>
                  <input type="text" value={patientForm.medicalHistorySummary} onChange={(e) => setPatientForm({ ...patientForm, medicalHistorySummary: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">Register patient</button>
              </form>
              {patientError && <p className="error-text">{patientError}</p>}
              {patientResult && (
                <div className="success-banner">
                  Registered {patientResult.name} â€” record {patientResult.id}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "book" && (
          <>
            <h2>Book appointment</h2>
            <p className="section-sub">Link a patient to a doctor at a specific time.</p>
            <div className="panel">
              <form onSubmit={handleBookAppointment}>
                <div className="field">
                  <label>Patient ID</label>
                  <input type="text" value={appointmentForm.patientId} onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Doctor</label>
                    <select value={appointmentForm.doctorId} onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}>
                      <option value="">Select a doctor</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>{doc.name} â€” {doc.specialization}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Date &amp; time</label>
                    <input type="datetime-local" value={appointmentForm.dateTime} onChange={(e) => setAppointmentForm({ ...appointmentForm, dateTime: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-accent">Book appointment</button>
              </form>
              {appointmentError && <p className="error-text">{appointmentError}</p>}
              {appointmentResult && (
                <div className="success-banner">
                  Booked â€” appointment {appointmentResult.id}, status {appointmentResult.status}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;