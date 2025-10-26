import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { Description, Settings, Logout, School, AdminPanelSettings } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { schoolData, logout, isAuthenticated, isAdmin } = useAuth();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
            <img 
              // src="/logo.png" 
              src="/tag-logo.svg" 

              alt="TAG Logo" 
              style={{ height: "40px", marginRight: "8px" }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              TagAIStudio
            </Typography>
          </Box>
        </Link>

        {schoolData && (
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <School sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ mr: 2 }}>
              {schoolData.school_name}
            </Typography>
            <Chip label={schoolData.board} size="small" color="success" />
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<Description />}
            sx={{
              backgroundColor: isActive("/")
                ? "rgba(255,255,255,0.1)"
                : "transparent",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Home
          </Button>

          {isAuthenticated && (
            <>
              <Button
                component={Link}
                to="/generate"
                color="inherit"
                startIcon={<Settings />}
                sx={{
                  backgroundColor: isActive("/generate")
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Generate
              </Button>

              {isAdmin && (
                <Button
                  component={Link}
                  to="/admin"
                  color="inherit"
                  startIcon={<AdminPanelSettings />}
                  sx={{
                    backgroundColor: isActive("/admin")
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Admin
                </Button>
              )}

              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={logout}
                sx={{
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
