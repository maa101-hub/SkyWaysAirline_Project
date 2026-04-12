import { createContext, useState, useEffect, use } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile,setProfile]=useState(null);
  const [name,SetName]=useState("");

  // ✅ safe decode function
  const decodeToken = (token) => {
    try {
      if (!token || token.split(".").length !== 3) return null;

      const decoded = jwtDecode(token);

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
        setUser(userData);
      });
  } else {
    localStorage.removeItem("token");
  }
}, []);
  // ✅ login
const login = async (token) => {
  const userData = decodeToken(token);

  if (!userData) return;

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
    setUser(userData);
  }
};
  // ✅ logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, login, logout,name }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;