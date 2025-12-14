// Queue.jsx
import { useState, useEffect } from "react";
import PatientDrawer from "../components/patientDrawer";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Queue() {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // listen once on mount (we'll poll the doc once here to display initial state;
  // for more dynamic UI in doctor panel you can use onSnapshot too)
  useEffect(() => {
    async function loadState() {
      const stateRef = doc(db, "doctorState", "main");
      const snap = await getDoc(stateRef);
      if (snap.exists()) {
        const data = snap.data();
        setQueue(data.queue || []);
        setCurrentPatient(data.currentPatient || null);
      }
    }
    loadState();
  }, []);

  const callNext = async () => {
    if (queue.length === 0) {
      alert("No patients in queue");
      return;
    }

    try {
      const nextPatient = queue[0];
      const remaining = queue.slice(1);

      const stateRef = doc(db, "doctorState", "main");
      await updateDoc(stateRef, {
        currentPatient: nextPatient,
        queue: remaining,
        lastUpdated: serverTimestamp()
      });

      // reflect locally immediately
      setCurrentPatient(nextPatient);
      setQueue(remaining);

      setDrawerOpen(true);
    } catch (err) {
      console.error("callNext error:", err);
      alert("Failed to call next patient");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Live Patient Queue</h1>

      <div style={{ marginTop: 20, padding: 15, background: "#497268ff", borderRadius: 10 }}>
        <h3>Now Serving:</h3>
        <h1>{currentPatient ? `${currentPatient.name} (Token ${currentPatient.id})` : "No Patient"}</h1>
      </div>

      <button onClick={callNext} style={{ marginTop: 20, padding: "10px 20px" }}>
        Call Next Patient
      </button>

      <div style={{ marginTop: 30 }}>
        <h3>Waiting Queue</h3>

        {queue.length === 0 ? (
          <p>No patients waiting</p>
        ) : (
          <ul>
            {queue.map((p, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{p.name} — {p.symptoms}</li>
            ))}
          </ul>
        )}
      </div>

      <PatientDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        patient={currentPatient}
      />
    </div>
  );
}
