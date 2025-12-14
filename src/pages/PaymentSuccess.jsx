import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function savePatient() {
      if (!user) return;

      const saved = sessionStorage.getItem("pendingPatient");
      if (!saved) return;

      const patientData = JSON.parse(saved);

      await setDoc(doc(db, "patients", user.uid), {
        ...patientData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        paid: true,
      });

      sessionStorage.removeItem("pendingPatient");
      navigate("/patient");
    }

    savePatient();
  }, [navigate, user]);

  return (
    <div style={{ padding: 40 }}>
      <h1>✅ Payment Successful</h1>
      <p>Finalizing registration...</p>
    </div>
  );
}
