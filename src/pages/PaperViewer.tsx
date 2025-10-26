import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { getPaper, replaceQuestion } from "../services/api";
import PaperStorageService from "../services/storage";
import QuestionPaperDisplay from "../components/QuestionPaperDisplay";

const PaperViewer = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const fetchPaper = async () => {
    if (!paperId) return;
    
    try {
      setLoading(true);
      
      // First try to load from localStorage
      const savedPaper = PaperStorageService.getPaperById(paperId);
      if (savedPaper) {
        console.log("Paper loaded from localStorage:", savedPaper.title);
        setPaper(savedPaper);
        setLoading(false);
        return;
      }
      
      // Fallback to API if not found in localStorage
      console.log("Paper not found in localStorage, trying API...");
      const data = await getPaper(paperId);
      setPaper(data);
    } catch (error) {
      toast.error("Failed to load paper");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionReplace = (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: any
  ) => {
    if (paper) {
      const updatedPaper = { ...paper };
      updatedPaper.sections[sectionIndex].questions[questionIndex] = newQuestion;
      setPaper(updatedPaper);
    }
  };

  const handleGeneratePrintable = (paperData: any) => {
    // This will be handled by the QuestionPaperDisplay component
    toast.success("Printable version generated!");
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!paper) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Paper not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ mt: 2 }}
          >
            Go Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box>
        <Button
          variant="outlined"
          onClick={() => navigate("/")}
          sx={{ mb: 2 }}
        >
          ← Back to Home
        </Button>
        <QuestionPaperDisplay
          paperData={paper}
          onQuestionReplace={handleQuestionReplace}
          onGeneratePrintable={handleGeneratePrintable}
        />
      </Box>
    </Container>
  );
};

export default PaperViewer;