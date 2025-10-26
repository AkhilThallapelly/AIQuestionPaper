import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { API_CONFIG } from "../constants";
import { useNavigate } from "react-router-dom";

interface SchoolData {
  username: string;
  school_name: string;
  principal_name: string;
  board: string;
  address: string;
  is_active: boolean;
  is_admin?: boolean;
}

interface AuthContextType {
  schoolData: SchoolData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (schoolData: SchoolData) => void;
  logout: () => void;
  verifySession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Load school data from sessionStorage on mount
  useEffect(() => {
    const storedSchoolData = sessionStorage.getItem("schoolData");
    const storedAuth = sessionStorage.getItem("isAuthenticated");

    if (storedSchoolData && storedAuth === "true") {
      try {
        const parsedData = JSON.parse(storedSchoolData);
        setSchoolData(parsedData);
        setIsAuthenticated(true);
        setIsAdmin(parsedData.is_admin || parsedData.username === "admin");
      } catch (error) {
        console.error("Error parsing school data:", error);
        sessionStorage.removeItem("schoolData");
        sessionStorage.removeItem("isAuthenticated");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (school: SchoolData) => {
    sessionStorage.setItem("schoolData", JSON.stringify(school));
    sessionStorage.setItem("isAuthenticated", "true");
    setSchoolData(school);
    setIsAuthenticated(true);
    setIsAdmin(school.is_admin || school.username === "admin");
  };

  const logout = () => {
    sessionStorage.removeItem("schoolData");
    sessionStorage.removeItem("isAuthenticated");
    setSchoolData(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate("/login");
  };

  const verifySession = async () => {
    if (!schoolData?.username) {
      logout();
      return;
    }

    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/auth/verify`,
        {
          params: { username: schoolData.username },
        }
      );

      if (response.data.success) {
        login(response.data.school);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        schoolData,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        logout,
        verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

