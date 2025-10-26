import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Download, Description } from "@mui/icons-material";
import toast from "react-hot-toast";
import { generateAnswerKey } from "../services/api";
import { AnswerKeyResponse, Question, hasOptions } from "../types/api";
import PaperStorageService from "../services/storage";
import { useAuth } from "../contexts/AuthContext";
// @ts-ignore
import jsPDF from "jspdf";

const AnswerKeyViewer = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { schoolData } = useAuth();
  const [answerKey, setAnswerKey] = useState<AnswerKeyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to extract answer text from various formats
  const getAnswerText = (answer: any): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    if (typeof answer === 'object' && answer !== null) {
      // Handle complex answer structure
      if (answer.correct_option) {
        return answer.correct_option;
      }
      if (answer.text) {
        return answer.text;
      }
      if (answer.answer) {
        return answer.answer;
      }
      if (answer.content) {
        return answer.content;
      }
      // If it's an object but no text field, stringify it
      return JSON.stringify(answer);
    }
    return String(answer);
  };

  useEffect(() => {
    fetchAnswerKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const fetchAnswerKey = async () => {
    console.log("AnswerKeyViewer - paperId from useParams:", paperId);
    
    if (!paperId) {
      toast.error("Paper ID is required");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching answer key for paper ID:", paperId);
      
      // First try to load from localStorage
      const savedAnswerKey = PaperStorageService.getAnswerKey(paperId);
      if (savedAnswerKey) {
        console.log("Answer key loaded from localStorage");
        setAnswerKey(savedAnswerKey);
        setLoading(false);
        return;
      }

      // If not found in localStorage, generate new one
      console.log("Answer key not found in localStorage, generating new one with paperId:", paperId);
      const data = await generateAnswerKey(paperId);
      console.log("Answer key data received:", data);
      
      // Save to localStorage
      PaperStorageService.saveAnswerKey(paperId, data);
      
      setAnswerKey(data);
    } catch (error: any) {
      console.error("Error fetching answer key:", error);
      console.error("Error details:", error?.response?.data);
      const errorMessage = error?.message || "Failed to generate answer key";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!answerKey) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // School Header (from login data)
    if (schoolData) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        schoolData.school_name,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 8;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        schoolData.address,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        "ANSWER KEY",
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 10;
    }

    // Paper Metadata
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${answerKey.metadata.board} | Class: ${answerKey.metadata.class_level} | Subject: ${answerKey.metadata.subject}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 8;
    doc.text(
      `Chapters: ${answerKey.metadata.chapters.join(", ")} | Total Marks: ${
        answerKey.metadata.marks
      }`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 15;

    // Answers
    answerKey.sections.forEach((section, sectionIndex: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${section.type} Answers`, margin, yPosition);
      yPosition += 10;

      section.questions.forEach((question: Question, questionIndex: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        // Question text
        const questionText = `${questionIndex + 1}. ${question.question}`;
        const splitText = doc.splitTextToSize(
          questionText,
          pageWidth - 2 * margin
        );
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5 + 5;

        // Answer
        doc.setFont("helvetica", "bold");
        const answerText = getAnswerText(question.answer);
        const answerLines = doc.splitTextToSize(
          `Answer: ${answerText}`,
          pageWidth - 2 * margin - 20
        );
        answerLines.forEach((line: string) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 10, yPosition);
          yPosition += 6;
        });

        // Explanation if exists
        if (typeof question.answer === 'object' && question.answer !== null && 'explanation' in question.answer && (question.answer as any).explanation) {
          doc.setFont("helvetica", "italic");
          const explanationLines = doc.splitTextToSize(
            `Explanation: ${String((question.answer as any).explanation)}`,
            pageWidth - 2 * margin - 20
          );
          explanationLines.forEach((line: string) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin + 10, yPosition);
            yPosition += 6;
          });
        }

        // Marks
        doc.setFont("helvetica", "normal");
        doc.text(`Marks: ${question.marks}`, margin + 10, yPosition);
        yPosition += 10;
      });

      yPosition += 10;
    });

    doc.save(`answer-key-${paperId}.pdf`);
    toast.success("Answer key downloaded successfully!");
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

  if (!answerKey) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Answer key not found
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/paper/${paperId}`)}
        >
          Back to Paper
        </Button>

        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={downloadPDF}
        >
          Download Answer Key
        </Button>
      </Box>

      {/* Answer Key Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Answer Key Header */}
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              pb: 3,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "success.main" }}
            >
              {answerKey.metadata.board} Answer Key
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Chip
                  label={`Class: ${answerKey.metadata.class_level}`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`Subject: ${answerKey.metadata.subject}`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`Chapters: ${answerKey.metadata.chapters.join(", ")}`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`Total Marks: ${answerKey.metadata.marks}`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`Difficulty: ${answerKey.metadata.difficulty}`}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Answers */}
          {answerKey.sections.map((section, sectionIndex: number) => (
            <Box key={sectionIndex} sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ color: "success.main", fontWeight: "bold" }}
              >
                {section.type} Answers ({section.total_marks} marks)
              </Typography>

              {section.questions.map(
                (question: Question, questionIndex: number) => (
                  <Card key={questionIndex} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {questionIndex + 1}. {question.question}
                        </Typography>
                        <Chip label={`${question.marks} marks`} size="small" />
                      </Box>

                      {/* Answer */}
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <Description sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              Answer:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {getAnswerText(question.answer)}
                            </Typography>
                            {typeof question.answer === 'object' && question.answer !== null && 'explanation' in question.answer && (question.answer as any).explanation && (
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "pre-wrap", mt: 1, fontStyle: 'italic' }}
                              >
                                <strong>Explanation:</strong> {String((question.answer as any).explanation)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Alert>

                      {/* MCQ Options with correct answer highlighted */}
                      {hasOptions(question) && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Options:
                          </Typography>
                          <Grid container spacing={1}>
                            {question.options.map(
                              (option: string, optionIndex: number) => {
                                const isCorrect = option === getAnswerText(question.answer);
                                return (
                                  <Grid item xs={12} sm={6} key={optionIndex}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        bgcolor: isCorrect
                                          ? "success.light"
                                          : "grey.100",
                                        borderRadius: 1,
                                        border: isCorrect ? 2 : 1,
                                        borderColor: isCorrect
                                          ? "success.main"
                                          : "grey.300",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: "bold", mr: 1 }}
                                      >
                                        {String.fromCharCode(65 + optionIndex)})
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          flexGrow: 1,
                                          fontWeight: isCorrect
                                            ? "bold"
                                            : "normal",
                                          color: isCorrect
                                            ? "success.dark"
                                            : "text.primary",
                                        }}
                                      >
                                        {option}
                                      </Typography>
                                      {isCorrect && (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: "bold",
                                            color: "success.dark",
                                          }}
                                        >
                                          ✓
                                        </Typography>
                                      )}
                                    </Box>
                                  </Grid>
                                );
                              }
                            )}
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </Box>
          ))}

          {/* Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This answer key was generated using AI technology.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please review answers for accuracy before use.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AnswerKeyViewer;
