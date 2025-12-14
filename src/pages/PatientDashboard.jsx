// PatientDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Navbar from "../components/Navbar";

export default function PatientDashboard() {
  const { user } = useAuth();

  const [patientData, setPatientData] = useState(null);
  const [consultations, setConsultations] = useState([]);

  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  /* -----------------------------
        LOAD PATIENT FIRESTORE DATA (one-time)
  ----------------------------- */
  useEffect(() => {
    if (!user) return;

    async function loadPatient() {
      const snap = await getDoc(doc(db, "patients", user.uid));
      if (snap.exists()) setPatientData(snap.data());
    }

    loadPatient();
  }, [user]);

  /* -----------------------------
        LISTEN TO DOCTOR STATE (LIVE)
  ----------------------------- */
  useEffect(() => {
    const stateRef = doc(db, "doctorState", "main");
    const unsub = onSnapshot(stateRef, (snap) => {
      if (!snap.exists()) {
        setQueue([]);
        setCurrent(null);
        return;
      }
      const data = snap.data();
      setQueue(data.queue || []);
      setCurrent(data.currentPatient || null);
    });

    return () => unsub();
  }, []);

  /* -----------------------------
        LISTEN TO CONSULTATIONS (LIVE)
  ----------------------------- */
  useEffect(() => {
    if (!user) return;
    const notesRef = query(collection(db, "patients", user.uid, "consultations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(notesRef, (snap) => {
      setConsultations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  const loggedPatientId = user?.uid;

  // Determine patient status from queue/current
  const myIsCurrent = current && current.id === loggedPatientId;
  const myIndexInQueue = queue.findIndex((p) => String(p.id) === String(loggedPatientId));
  const patientsAhead = myIndexInQueue === -1 ? 0 : myIndexInQueue;
  const myStatus = myIsCurrent ? "In Consultation" : (myIndexInQueue === -1 ? "Not Booked" : "Waiting");

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Patient Dashboard</h1>

        {/* PATIENT DETAILS */}
        {patientData && (
          <div style={infoBox}>
            <h2>Your Details</h2>
            <p><strong>Name:</strong> {patientData.name}</p>
            <p><strong>Age:</strong> {patientData.age}</p>
            <p><strong>Gender:</strong> {patientData.gender}</p>
            <p><strong>Phone:</strong> {patientData.phone}</p>
            <p><strong>Symptoms:</strong> {patientData.symptoms}</p>
          </div>
        )}

        {/* DOCTOR NOTES */}
        {consultations.length > 0 && (
          <div style={infoBox}>
            <h2>Doctor Notes</h2>
            {consultations.map((c) => (
              <div key={c.id} style={{ marginBottom: "15px" }}>
                <p><strong>Date:</strong> {c.createdAt?.toDate?.().toLocaleString?.()}</p>
                <p><strong>Notes:</strong> {c.doctorNotes}</p>
                <hr />
              </div>
            ))}
          </div>
        )}

        {/* NOW SERVING */}
        <div style={boxStyle}>
          <h3>Now Serving</h3>
          <h1>
            {current
              ? (current.id === loggedPatientId ? "Doctor is calling you!" : `Token ${current.id}`)
              : "No patient currently"}
          </h1>
        </div>

        {/* MY STATUS */}
        <div style={boxStyle}>
          <h3>My Status</h3>
          <h2>{myStatus}</h2>
        </div>

        {/* PATIENTS AHEAD */}
        <div style={boxStyle}>
          <h3>Patients Ahead of You</h3>
          <h1>{patientsAhead}</h1>
        </div>
      </div>
    </>
  );
}

const boxStyle = {
  background: "#4dd468ff",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "20px",
};

const infoBox = {
  background: "#168bc1ff",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "25px",
  border: "1px solid #bde7ff",
};
