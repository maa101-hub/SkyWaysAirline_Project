import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile,setProfile]=useState(null);
  const [name,SetName]=useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ safe decode function
  const decodeToken = (token) => {
    try {
      if (!token || token.split(".").length !== 3) return null;

      const decoded = jwtDecode(token);

      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        return null;
      }

      return {
        email: decoded.sub,
        role: decoded.role,
      };
    } catch (err) {
      console.log("Invalid token");
      return null;
    }
  };

  // ✅ load user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    const userData = decodeToken(token);

    if (userData) {
      axios
        .get("http://localhost:8082/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(userData);          // basic user
          setProfile(res.data);
          SetName(res.data.firstName);      // 🔥 full profile
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setProfile(null);
          SetName("");
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      localStorage.removeItem("token");
      setAuthLoading(false);
    }
  }, []);
  // ✅ login
const login = async (token) => {
  const userData = decodeToken(token);

  if (!userData) return;

  setAuthLoading(true);
  localStorage.setItem("token", token);

  try {
    const res = await axios.get(
      "http://localhost:8082/api/users/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(userData);
    setProfile(res.data); // 🔥 important
    SetName(res.data.firstName); 
  } catch {
    localStorage.removeItem("token");
    setUser(null);
    setProfile(null);
    SetName("");
  } finally {
    setAuthLoading(false);
  }
};
  // ✅ logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setProfile(null);
    SetName("");
    setAuthLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, login, logout, name, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;