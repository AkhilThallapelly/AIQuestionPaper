import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Box,
  Chip,
} from "@mui/material";
import {
  Add,
  Delete,
  Visibility,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { API_CONFIG } from "../constants";
import { useAuth } from "../contexts/AuthContext";

interface School {
  username: string;
  school_name: string;
  principal_name: string;
  board: string;
  address: string;
  created_at: string;
  is_active: boolean;
}

const Admin = () => {
  const { isAdmin } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<string>("");
  const [newSchool, setNewSchool] = useState({
    username: "",
    password: "",
    school_name: "",
    principal_name: "",
    board: "CBSE",
    address: "",
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/auth/schools`);
      setSchools(response.data.schools);
    } catch (error: any) {
      console.error("Error loading schools:", error);
      toast.error("Failed to load schools");
    }
  };

  const handleAddSchool = async () => {
    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}/auth/add-school`,
        newSchool
      );

      if (response.data.success) {
        toast.success("School added successfully!");
        setAddDialogOpen(false);
        setNewSchool({
          username: "",
          password: "",
          school_name: "",
          principal_name: "",
          board: "CBSE",
          address: "",
        });
        loadSchools();
      }
    } catch (error: any) {
      console.error("Error adding school:", error);
      toast.error(error.response?.data?.detail || "Failed to add school");
    }
  };

  const handleDeleteSchool = async () => {
    try {
      const response = await axios.delete(
        `${API_CONFIG.baseURL}/auth/schools/${schoolToDelete}`
      );

      if (response.data.success) {
        toast.success("School deleted successfully!");
        setDeleteDialogOpen(false);
        setSchoolToDelete("");
        loadSchools();
      }
    } catch (error: any) {
      console.error("Error deleting school:", error);
      toast.error(error.response?.data?.detail || "Failed to delete school");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You do not have permission to access this page.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          School Administration
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add School
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>School Name</TableCell>
              <TableCell>Principal</TableCell>
              <TableCell>Board</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools
              .filter((school) => school.username !== "admin")
              .map((school) => (
                <TableRow key={school.username}>
                  <TableCell>{school.username}</TableCell>
                  <TableCell>{school.school_name}</TableCell>
                  <TableCell>{school.principal_name}</TableCell>
                  <TableCell>{school.board}</TableCell>
                  <TableCell>{school.address}</TableCell>
                  <TableCell>{formatDate(school.created_at)}</TableCell>
                  <TableCell>
                    <Chip
                      label={school.is_active ? "Active" : "Inactive"}
                      color={school.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSchoolToDelete(school.username);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add School Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New School</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={newSchool.username}
            onChange={(e) => setNewSchool({ ...newSchool, username: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newSchool.password}
            onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="School Name"
            value={newSchool.school_name}
            onChange={(e) => setNewSchool({ ...newSchool, school_name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Principal Name"
            value={newSchool.principal_name}
            onChange={(e) => setNewSchool({ ...newSchool, principal_name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Board</InputLabel>
            <Select
              value={newSchool.board}
              onChange={(e) => setNewSchool({ ...newSchool, board: e.target.value })}
              label="Board"
            >
              <MenuItem value="CBSE">CBSE</MenuItem>
              <MenuItem value="ICSE">ICSE</MenuItem>
              <MenuItem value="SSC">SSC</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={newSchool.address}
            onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSchool} variant="contained">
            Add School
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this school? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSchool} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;

