import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
  IconButton,   
} from "@mui/material";
import { 
  School, 
  Lock, 
  Login as LoginIcon, 
  Visibility,     
  VisibilityOff  
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { API_CONFIG } from "../constants";

interface SchoolData {
  username: string;
  school_name: string;
  principal_name: string;
  board: string;
  address: string;
  is_active: boolean;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}/auth/login`,
        credentials
      );

      if (response.data.success) {
        const schoolData: SchoolData = response.data.school;
        
        // Use the login function from AuthContext to update state
        login(schoolData);
        
        toast.success(`Welcome, ${schoolData.school_name}!`);
        navigate("/");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "Failed to login. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };


  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 2,
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "rgba(255, 255, 255, 0.2)",
                mb: 2,
              }}
            >
              <School sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              AI Question Paper Generator
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              School Portal Login
            </Typography>
          </Box>

          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: "white",
              color: "text.primary",
            }}
          >
            <form onSubmit={handleLogin}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
                Login to Your Account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Username"
                fullWidth
                required
                margin="normal"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <School sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"} 
                fullWidth
                required
                margin="normal"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  endAdornment: ( 
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Contact your administrator for credentials
              </Typography>
            </form>
          </Paper>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;