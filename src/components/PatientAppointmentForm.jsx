import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function PatientAppointmentForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    symptoms: "",
    doctor: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const bookAppointment = async () => {
    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        ...form,
        patientId: auth.currentUser?.uid || null,
        createdAt: Timestamp.now(),
        status: "pending"
      });

      alert("Appointment booked successfully!");
      setForm({
        name: "",
        age: "",
        gender: "",
        phone: "",
        symptoms: "",
        doctor: ""
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Book Appointment</h2>

      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <textarea name="symptoms" placeholder="Describe symptoms" value={form.symptoms} onChange={handleChange} />

      <select name="doctor" value={form.doctor} onChange={handleChange}>
        <option value="">Select Doctor</option>
        <option value="doctorA">Dr. A</option>
        <option value="doctorB">Dr. B</option>
      </select>

      <button onClick={bookAppointment}>Submit</button>
    </div>
  );
}
