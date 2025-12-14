import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // User logged in → load role from Firestore
      setUser(currentUser);

      const roleDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (roleDoc.exists()) {
        const role = roleDoc.data().role;
        setUserRole(role);

        // Redirect rules based on role
        if (role === "doctor" && location.pathname === "/patient-register") {
          navigate("/doctor", { replace: true });
        }

        if (role === "patient") {
          const patDoc = await getDoc(doc(db, "patients", currentUser.uid));

          // patient not registered → force to register
          if (!patDoc.exists() && location.pathname !== "/patient-register") {
            navigate("/patient-register", { replace: true });
          }

          // patient registered but tries /patient-register → send to dashboard
          if (patDoc.exists() && location.pathname === "/patient-register") {
            navigate("/patient", { replace: true });
          }
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, userRole, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
