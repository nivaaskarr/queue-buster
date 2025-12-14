import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>❌ Payment Cancelled</h1>
      <p>You can try again.</p>
      <button onClick={() => navigate("/patient-register")}>
        Go Back
      </button>
    </div>
  );
}
