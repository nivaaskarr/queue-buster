import React, { useState } from "react";
import ReactDOM from "react-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function PatientDrawer({ isOpen, onClose, patient }) {
  const { user } = useAuth(); // doctor user
  const [notes, setNotes] = useState("");

  if (!isOpen || !patient) return null;

  // ---------------------------
  // SAVE NOTES TO FIRESTORE
  // ---------------------------
  const handleSave = async () => {
    if (!notes.trim()) {
      alert("Please enter some notes before saving.");
      return;
    }

    try {
      await addDoc(
        collection(db, "patients", patient.id, "consultations"),
        {
          doctorId: user.uid,
          patientId: patient.id,
          doctorNotes: notes,
          createdAt: serverTimestamp(),
        }
      );

      alert("Doctor notes saved!");
      setNotes("");
      onClose(); // close drawer after saving
    } catch (err) {
      console.error("Error saving notes:", err);
      alert("Failed to save notes.");
    }
  };

  return ReactDOM.createPortal(
    (
      <div style={overlayStyle}>
        <div style={drawerStyle}>
          <button style={closeBtn} onClick={onClose}>✖</button>

          <h2>Patient Details</h2>

          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Symptoms:</strong> {patient.symptoms}</p>

          <textarea
            placeholder="Write notes..."
            style={notesBox}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button style={saveBtn} onClick={handleSave}>
            Save Notes
          </button>
        </div>
      </div>
    ),
    document.body
  );
}

/* ---------- STYLES ---------- */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 9999,
};

const drawerStyle = {
  width: "380px",
  height: "100%",
  background: "#1f2937",
  padding: "20px",
  boxShadow: "-3px 0 10px rgba(0,0,0,0.4)",
  color: "white",
  overflowY: "auto",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: 15,
  right: 15,
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "20px",
  cursor: "pointer",
};

const notesBox = {
  width: "100%",
  height: "150px",
  marginTop: "20px",
  borderRadius: "8px",
  padding: "10px",
};

const saveBtn = {
  marginTop: "20px",
  padding: "10px",
  width: "100%",
  background: "#10b981",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  color: "white",
  fontSize: "16px",
};
