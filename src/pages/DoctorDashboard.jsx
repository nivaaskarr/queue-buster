// DoctorDashboard.jsx
import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PatientDrawer from "../components/patientDrawer.jsx";
import Queue from "./Queue";
import "../styles/DoctorDashboard.css";

import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/* STYLES (kept same as your original) */
const container = {
  padding: "40px",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a, #020617)",
  color: "white",
};
const title = {
  fontSize: "32px",
  fontWeight: "bold",
  marginBottom: "30px",
};

/* ================= DOCTOR HOME ================= */
function DoctorHome() {
  const [appointments, setAppointments] = useState([
    // sample appointments — you can replace these with your booking system later
    { id: "101", name: "John", age: 32, phone: "999", symptoms: "Fever", status: "Waiting" },
    { id: "102", name: "Sara", age: 28, phone: "888", symptoms: "Cough", status: "Waiting" },
    { id: "103", name: "Ali", age: 40, phone: "777", symptoms: "Headache", status: "Waiting" }
  ]);
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // load live queue snapshot once to show waiting count in dashboard
  useEffect(() => {
    async function loadQueue() {
      try {
        const stateRef = doc(db, "doctorState", "main");
        const snap = await getDoc(stateRef);
        if (snap.exists()) {
          const data = snap.data();
          setQueue(data.queue || []);
        } else {
          // if doc doesn't exist, you can create it elsewhere or in console
          setQueue([]);
        }
      } catch (err) {
        console.error("loadQueue error:", err);
      }
    }
    loadQueue();
  }, []);

  // When doctor clicks a patient from queue (open drawer)
  const handlePatientClick = (patientObj) => {
    setSelectedPatient(patientObj);
    setIsDrawerOpen(true);
  };

  return (
    <div style={container}>
      <h1 style={title}>Welcome, Doctor 👨‍⚕️</h1>

      {/* ---------- DASHBOARD STATS ---------- */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Appointments</h3>
          <p>{appointments.length}</p>
        </div>

        <div className="stat-card orange">
          <h3>Waiting Patients</h3>
          <p>{queue.length}</p>
        </div>

        <div className="stat-card purple">
          <h3>In Progress</h3>
          <p>1</p>
        </div>

        <div className="stat-card green">
          <h3>Completed</h3>
          <p>2</p>
        </div>
      </div>

      {/* optionally show short list & allow click to open drawer */}
      <div style={{ marginTop: 30 }}>
        <h3>Quick Queue Preview</h3>
        {queue.length === 0 ? (
          <p style={{ color: "#aaa" }}>No patients in queue</p>
        ) : (
          <ul>
            {queue.map((p) => (
              <li key={p.id} style={{ color: "lightblue", cursor: "pointer" }} onClick={() => handlePatientClick(p)}>
                {p.name} — {p.symptoms || "No symptoms"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <PatientDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedPatient(null); }}
        patient={selectedPatient}
      />
    </div>
  );
}

/* ================= APPOINTMENTS ================= */
function Appointments() {
  const [appointments, setAppointments] = useState([
    { id: "101", name:"John", age:32, phone:"999", symptoms:"Fever", status:"Waiting" },
    { id: "102", name:"Sara", age:28, phone:"888", symptoms:"Cough", status:"Waiting" },
    { id: "103", name:"Ali", age:40, phone:"777", symptoms:"Headache", status:"Waiting" }
  ]);

  // persist appointments only locally for now (if you migrate to Firestore later, modify)
  useEffect(() => {
    // no localStorage usage for queue/state anymore; appointments remain local for demo
  }, [appointments]);

  // sendToQueue now writes to Firestore doctorState/main.queue
  const sendToQueue = async (patientId) => {
    const patientObj = appointments.find((p) => String(p.id) === String(patientId));
    if (!patientObj) {
      console.error("sendToQueue: patient not found", patientId);
      alert("Patient not found");
      return;
    }

    try {
      const stateRef = doc(db, "doctorState", "main");
      const snap = await getDoc(stateRef);
      const existing = snap.exists() ? (snap.data().queue || []) : [];

      // append the full patient object (you can store only ids if you prefer)
      const newQueue = [...existing, patientObj];

      await updateDoc(stateRef, {
        queue: newQueue,
        lastUpdated: serverTimestamp()
      });

      // remove patient from appointments list locally
      const updatedAppointments = appointments.filter((p) => String(p.id) !== String(patientId));
      setAppointments(updatedAppointments);

      //alert(`Patient ${patientId} sent to queue`);
    } catch (err) {
      console.error("sendToQueue error:", err);
      alert("Failed to send to queue");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Today's Appointments</h2>

      {appointments.length === 0 ? (
        <p style={{ color: "#aaa" }}>No appointments left</p>
      ) : (
        appointments.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#1f1f1f",
              marginBottom: "18px",
              padding: "18px",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
            }}
          >
            <div>
              <h3 style={{ marginBottom: "6px" }}>{item.name}</h3>
              <p style={{ color: "#bbb" }}>Time: {item.time}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{ marginBottom: "8px", color: "#ffd700" }}>
                Status: {item.status}
              </p>

              <button
                onClick={() => sendToQueue(item.id)}
                style={{
                  background: "#4CAF50",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Send to Queue
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= QUEUE (a simple wrapper uses the separate Queue.jsx route) ================= */
export default function DoctorDashboard() {
  return (
    <>
      <Navbar />

      <div className="doctor-container" style={{ marginTop: "74px" }}>
        <div className="doctor-sidebar">
          <h2>Doctor Panel</h2>

          <Link className="doctor-link" to="/doctor">
            Dashboard
          </Link>

          <Link className="doctor-link" to="/doctor/appointments">
            Appointments
          </Link>
          <Link className="doctor-link" to="/doctor/queue">
            Queue
          </Link>
        </div>

        <div className="doctor-main">
          <Routes>
            <Route index element={<DoctorHome />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="queue" element={<Queue />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
