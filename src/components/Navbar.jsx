// src/components/Navbar.jsx
//import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
  const { userRole, logout } = useAuth();
  return (
    <nav style={navWrap}>
      <div style={navLeft}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Hospital System</h2>
      </div>

      <div style={navRight}>
        <span style={{ marginRight: 12 }}>
          {userRole === "doctor" ? "👨‍⚕️ Doctor" : "👤 Patient"}
        </span>
        <button onClick={logout} style={logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const NAV_HEIGHT = 74;

const navWrap = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: NAV_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  background: "#0f172a",
  color: "white",
  zIndex: 1000,
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
};

const navLeft = { display: "flex", alignItems: "center", minWidth: 160 };
const navCenter = {
  display: "flex",
  gap: 20,
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
};
const navRight = { display: "flex", alignItems: "center", gap: 12 };

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 6,
  fontWeight: 600,
};

const logoutBtn = {
  padding: "8px 12px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
