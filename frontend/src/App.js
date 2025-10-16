import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/Login";
import Principal from "./components/Principal";
import Register from "./components/Register";
import { getUserRequest } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getUserRequest();
          setUser(res.data);
        } catch (err) {
          console.error("Token inválido o error al obtener usuario", err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
        }}
      >
        Cargando...
      </div>
    );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/principal" : "/login"} />} />
        <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/principal/*"
          element={
            user ? (
              <Principal user={user} onLogout={() => setUser(null)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
