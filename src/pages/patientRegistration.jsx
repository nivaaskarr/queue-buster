import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


export default function PatientRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    symptoms: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    alert("No user logged in");
    return;
  }

  try {
    // 🔹 Registration fee (example ₹500)
    const amount = 500;

    // 🔹 Call backend to create Stripe Checkout session
    const res = await fetch("http://localhost:5000/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    if (!data.url) {
      alert("Failed to initiate payment");
      return;
    }

    // 🔹 Temporarily store patient form data
    sessionStorage.setItem(
      "pendingPatient",
      JSON.stringify(form)
    );

    // 🔹 Redirect to Stripe Checkout
    window.location.href = data.url;

  } catch (err) {
    console.error("Stripe checkout error:", err);
    alert("Something went wrong while starting payment");
  }
};

  return (
    <div style={wrap}>
      <form style={card} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: 20 }}>Patient Registration</h2>

        <input
          style={input}
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          style={input}
          name="age"
          placeholder="Age"
          type="number"
          value={form.age}
          onChange={handleChange}
          required
        />

        <select
          style={input}
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          style={input}
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <textarea
          style={input}
          name="symptoms"
          placeholder="Symptoms"
          value={form.symptoms}
          onChange={handleChange}
          required
        />

        <textarea
          style={input}
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <button style={btn}>Submit</button>
      </form>
    </div>
  );
}

/* ======= STYLES ======= */

const wrap = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0f172a",
};

const card = {
  width: 400,
  padding: 30,
  background: "white",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const btn = {
  padding: "12px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: 10,
};
