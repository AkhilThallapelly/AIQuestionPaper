import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  GetApp as GetAppIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { 
  PaperGenerationResponse, 
  Question, 
  MCQQuestion, 
  FillBlankQuestion 
} from "../types/api";
import { hasOptions } from "../types/api";
import { replaceQuestion, generateAnswerKey } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import jsPDF from "jspdf";
import PrintablePaperView from "./PrintablePaperView";
import PaperStorageService from "../services/storage";
import { useAuth } from "../contexts/AuthContext";

interface QuestionPaperDisplayProps {
  paperData: PaperGenerationResponse;
  onQuestionReplace: (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: Question
  ) => void;
  onGeneratePrintable: (paperData: PaperGenerationResponse) => void;
}

interface SelectedQuestion {
  sectionIndex: number;
  questionIndex: number;
  question: Question;
}

const QuestionPaperDisplay = ({
  paperData,
  onQuestionReplace,
  onGeneratePrintable,
}: QuestionPaperDisplayProps) => {
  const navigate = useNavigate();
  const { schoolData } = useAuth();
  const [selectedQuestions, setSelectedQuestions] = useState<
    SelectedQuestion[]
  >([]);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [replacingQuestions, setReplacingQuestions] = useState(false);
  const [generatingAnswerKey, setGeneratingAnswerKey] = useState(false);
  const [downloadingPaper, setDownloadingPaper] = useState(false);
  const [showPrintableDialog, setShowPrintableDialog] = useState(false);
  const [showAnswerKeyDialog, setShowAnswerKeyDialog] = useState(false);
  const [answerKeyData, setAnswerKeyData] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionIndex: number;
    questionIndex: number;
    question: Question;
  } | null>(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");
  const [editedOptions, setEditedOptions] = useState<string[]>([]);
  const [editedAnswer, setEditedAnswer] = useState("");
  
  // Initialize school details from login data
  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: schoolData?.school_name || "Your School Name",
    address: schoolData?.address || "School Address",
    examType: "Mid-Term Examination",
    academicYear: "2024-25",
    date: new Date().toLocaleDateString("en-IN"),
    time: "2 Hours",
    instructions:
      "• Read all questions carefully before answering\n• All questions are compulsory\n• Write answers in the space provided\n• Use blue or black ink only\n• Check your answers before submitting",
  });

  // Update school details when login data changes
  useEffect(() => {
    if (schoolData) {
      setSchoolDetails(prev => ({
        ...prev,
        schoolName: schoolData.school_name,
        address: schoolData.address,
      }));
    }
  }, [schoolData]);

  const handleQuestionSelect = (
    sectionIndex: number,
    questionIndex: number,
    question: Question
  ) => {
    const selectedIndex = selectedQuestions.findIndex(
      (sq) =>
        sq.sectionIndex === sectionIndex && sq.questionIndex === questionIndex
    );

    if (selectedIndex >= 0) {
      // Remove from selection
      setSelectedQuestions(
        selectedQuestions.filter((_, index) => index !== selectedIndex)
      );
    } else {
      // Add to selection
      setSelectedQuestions([
        ...selectedQuestions,
        { sectionIndex, questionIndex, question },
      ]);
    }
  };

  const handleReplaceSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;

    // Get paper ID from either paper_id or id field (for SavedPaper objects)
    const paperId = (paperData as any)?.paper_id || (paperData as any)?.id;
    
    if (!paperId) {
      toast.error("Paper ID is missing. Cannot replace questions.");
      console.error("paperData:", paperData);
      return;
    }

    setReplacingQuestions(true);
    try {
      for (const selectedQuestion of selectedQuestions) {
        console.log("Replacing question:", selectedQuestion);
        console.log("Question object:", selectedQuestion.question);

        // Ensure we have the question text
        const questionText = selectedQuestion.question?.question || "";
        if (!questionText) {
          console.error("No question text found for replacement");
          continue;
        }

        const response = await replaceQuestion(
          paperId,
          selectedQuestion.sectionIndex,
          selectedQuestion.questionIndex,
          questionText
        );

        console.log("Replace question response:", response);

        if (response.success && response.new_question) {
          onQuestionReplace(
            selectedQuestion.sectionIndex,
            selectedQuestion.questionIndex,
            response.new_question
          );
          console.log(
            "Successfully replaced question:",
            selectedQuestion.questionIndex
          );
        } else {
          console.error(
            "Failed to replace question:",
            response.message || "Unknown error"
          );
        }
      }
      
      // Delete saved answer key since questions have been replaced
      PaperStorageService.deleteAnswerKey(paperId);
      console.log("Answer key invalidated due to question replacement");
      
      setSelectedQuestions([]);
      setReplaceDialogOpen(false);

      // Show success message
      if (selectedQuestions.length > 0) {
        console.log(
          `Successfully replaced ${selectedQuestions.length} question(s)`
        );
      }
    } catch (error) {
      console.error("Error replacing questions:", error);
    } finally {
      setReplacingQuestions(false);
    }
  };

  const handleEditQuestion = (
    sectionIndex: number,
    questionIndex: number,
    question: Question
  ) => {
    setEditingQuestion({ sectionIndex, questionIndex, question });
    setEditedQuestionText(question.question || "");
    // Only set options if the question has them (MCQ)
    setEditedOptions(hasOptions(question) ? [...question.options] : []);
    setEditedAnswer(question.answer || "");
    setEditDialogOpen(true);
  };

  const handleSaveEditedQuestion = () => {
    if (!editingQuestion) return;

    // Create updated question based on type
    let updatedQuestion: Question;
    
    if (hasOptions(editingQuestion.question)) {
      // MCQ question with options
      updatedQuestion = {
        question: editedQuestionText,
        answer: editedAnswer,
        marks: editingQuestion.question.marks,
        options: editedOptions,
      } as MCQQuestion;
    } else {
      // Non-MCQ question (FillBlank or Answer)
      updatedQuestion = {
        question: editedQuestionText,
        answer: editedAnswer,
        marks: editingQuestion.question.marks,
      } as FillBlankQuestion;
    }

    onQuestionReplace(
      editingQuestion.sectionIndex,
      editingQuestion.questionIndex,
      updatedQuestion
    );

    // Delete saved answer key since question has changed
    PaperStorageService.deleteAnswerKey(paperData.paper_id);
    console.log("Answer key invalidated due to question update");

    setEditDialogOpen(false);
    setEditingQuestion(null);
    toast.success("Question updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingQuestion(null);
    setEditedQuestionText("");
    setEditedOptions([]);
    setEditedAnswer("");
  };

  const handleAddOption = () => {
    setEditedOptions([...editedOptions, ""]);
  };

  const handleDeleteOption = (index: number) => {
    setEditedOptions(editedOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...editedOptions];
    updatedOptions[index] = value;
    setEditedOptions(updatedOptions);
  };

  const handleGenerateAnswerKeyDialog = async () => {
    // Get paper ID from either paper_id or id field (for SavedPaper objects)
    const paperId = (paperData as any)?.paper_id || (paperData as any)?.id;
    
    console.log("handleGenerateAnswerKeyDialog called, paperId:", paperId);
    console.log("paperData:", paperData);
    
    if (!paperId) {
      toast.error("Paper ID is missing. Cannot generate answer key.");
      console.error("paperData:", paperData);
      return;
    }
    
    setGeneratingAnswerKey(true);
    try {
      console.log("Generating answer key for dialog:", paperId);
      
      // First try to load from localStorage
      const savedAnswerKey = PaperStorageService.getAnswerKey(paperId);
      if (savedAnswerKey) {
        console.log("Answer key loaded from localStorage");
        setAnswerKeyData(savedAnswerKey);
        setShowAnswerKeyDialog(true);
        toast.success("Answer key loaded successfully!");
        setGeneratingAnswerKey(false);
        return;
      }

      // If not found in localStorage, generate new one
      console.log("Answer key not found in localStorage, generating new one");
      const answerKey = await generateAnswerKey(paperId);
      console.log("Answer key generated successfully:", answerKey);

      // Save to localStorage
      PaperStorageService.saveAnswerKey(paperId, answerKey);

      setAnswerKeyData(answerKey);
      setShowAnswerKeyDialog(true);
      toast.success("Answer key generated successfully!");
    } catch (error: any) {
      console.error("Error generating answer key:", error);
      console.error("Error details:", error?.response?.data);
      const errorMessage =
        error?.message || "Failed to generate answer key. Please try again.";
      toast.error(errorMessage);
    } finally {
      setGeneratingAnswerKey(false);
    }
  };

  const handleDownloadQuestionPaper = () => {
    setDownloadingPaper(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = 170;
      let yPos = 20;

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Add school header
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(schoolDetails.schoolName, 105, yPos, { align: "center" });
      yPos += 8;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(schoolDetails.address, 105, yPos, { align: "center" });
      yPos += 10;

      // Add exam details
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(schoolDetails.examType, 105, yPos, { align: "center" });
      yPos += 15;

      // Add exam details
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Academic Year: ${schoolDetails.academicYear}`, margin, yPos);
      pdf.text(`Date: ${schoolDetails.date}`, margin + 70, yPos);
      pdf.text(`Time: ${schoolDetails.time}`, margin + 140, yPos);
      yPos += 10;

      pdf.text(`Subject: ${paperData.metadata.subject}`, margin, yPos);
      pdf.text(`Class: ${paperData.metadata.class_level}`, margin + 50, yPos);
      pdf.text(`Board: ${paperData.metadata.board}`, margin + 100, yPos);
      pdf.text(`Total Marks: ${paperData.metadata.marks}`, margin + 150, yPos);
      yPos += 10;

      // Add line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, margin + contentWidth, yPos);
      yPos += 5;

      // Add instructions
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      const instructions = schoolDetails.instructions.split("\n");
      const boxWidth = 120;
      const boxPadding = 5;
      const boxHeight = instructions.length * 5 + 10 + boxPadding;
      const boxX = (210 - boxWidth) / 2;
      const boxY = yPos;

      pdf.setLineWidth(0.5);
      pdf.rect(boxX, boxY, boxWidth, boxHeight);

      pdf.text(
        "General Instructions:",
        boxX + boxPadding,
        boxY + boxPadding + 2
      );

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      instructions.forEach((instruction: string, index: number) => {
        checkPageBreak(5);
        pdf.text(
          instruction,
          boxX + boxPadding,
          boxY + boxPadding + 7 + index * 5
        );
      });

      yPos += boxHeight + 12;

      // Add questions
      checkPageBreak(15);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("QUESTIONS", margin, yPos);
      yPos += 12;

      paperData.sections.forEach((section, sectionIndex: number) => {
        checkPageBreak(12);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");

        const questionsCount = section.questions.length;
        const totalMarks = section.total_marks;
        const marksPerQuestion =
          questionsCount > 0 ? totalMarks / questionsCount : 0;

        pdf.text(
          `Section ${sectionIndex + 1}: ${
            section.type
          } (${questionsCount} × ${marksPerQuestion} = ${totalMarks} marks)`,
          margin,
          yPos
        );
        yPos += 10;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        section.questions.forEach(
          (question: Question, questionIndex: number) => {
            const questionText = `Q${questionIndex + 1}. ${question.question}`;
            const lines = pdf.splitTextToSize(questionText, contentWidth);

            checkPageBreak(lines.length * 5 + 15);

            lines.forEach((line: string) => {
              pdf.text(line, margin + 5, yPos);
              yPos += 5;
            });

            if (hasOptions(question)) {
              question.options.forEach(
                (option: string, optionIndex: number) => {
                  checkPageBreak(6);
                  pdf.text(
                    `${String.fromCharCode(65 + optionIndex)}. ${option}`,
                    margin + 15,
                    yPos
                  );
                  yPos += 6;
                }
              );
            }

            yPos += 8;
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
          }
        );

        yPos += 8;
      });

      // Save the PDF
      pdf.save(
        `${schoolDetails.examType}_${paperData.metadata.subject}_Class${paperData.metadata.class_level}.pdf`
      );

      toast.success("Question paper downloaded successfully!");
    } catch (error) {
      console.error("Error downloading question paper:", error);
      toast.error("Failed to download question paper. Please try again.");
    } finally {
      setDownloadingPaper(false);
    }
  };

  const handleDownloadAnswerKey = async () => {
    setGeneratingAnswerKey(true);
    try {
      console.log("Generating answer key for download:", paperData.paper_id);
      const answerKey = await generateAnswerKey(paperData.paper_id);

      // Generate PDF for answer key
      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = 297;
      const margin = 20;
      let yPos = 20;

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${answerKey.metadata.board} Answer Key`, 105, yPos, {
        align: "center",
      });
      yPos += 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Class: ${answerKey.metadata.class_level} | Subject: ${answerKey.metadata.subject}`,
        105,
        yPos,
        { align: "center" }
      );
      yPos += 8;
      pdf.text(
        `Chapters: ${answerKey.metadata.chapters.join(", ")} | Total Marks: ${
          answerKey.metadata.marks
        }`,
        105,
        yPos,
        { align: "center" }
      );
      yPos += 15;

      // Answers
      answerKey.sections.forEach((section, sectionIndex: number) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${section.type} Answers`, margin, yPos);
        yPos += 10;

        section.questions.forEach(
          (question: Question, questionIndex: number) => {
            if (yPos > 250) {
              pdf.addPage();
              yPos = margin;
            }

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");

            const questionText = `${questionIndex + 1}. ${question.question}`;
            const splitText = pdf.splitTextToSize(questionText, 170);
            pdf.text(splitText, margin, yPos);
            yPos += splitText.length * 5 + 5;

            pdf.setFont("helvetica", "bold");
            pdf.text(`Answer: ${question.answer}`, margin + 10, yPos);
            yPos += 8;

            pdf.setFont("helvetica", "normal");
            pdf.text(`Marks: ${question.marks}`, margin + 10, yPos);
            yPos += 10;
          }
        );

        yPos += 10;
      });

      pdf.save(`answer-key-${paperData.paper_id}.pdf`);
      toast.success("Answer paper generated and downloaded successfully!");
    } catch (error: any) {
      console.error("Error generating and downloading answer key:", error);
      const errorMessage =
        error?.message || "Failed to generate answer paper. Please try again.";
      toast.error(errorMessage);
    } finally {
      setGeneratingAnswerKey(false);
    }
  };

  const renderQuestion = (
    question: Question,
    sectionIndex: number,
    questionIndex: number
  ) => {
    console.log("Rendering question:", question, "at index:", questionIndex);

    const isSelected = selectedQuestions.some(
      (sq) =>
        sq.sectionIndex === sectionIndex && sq.questionIndex === questionIndex
    );

    return (
      <Box key={questionIndex} sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSelected}
                onChange={() =>
                  handleQuestionSelect(sectionIndex, questionIndex, question)
                }
                size="small"
              />
            }
            label=""
            sx={{ mt: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Q{questionIndex + 1}.</strong>{" "}
              {question?.question || "No question text"}
            </Typography>

            {hasOptions(question) && (
              <Box sx={{ ml: 2, mb: 1 }}>
                {question.options.map((option: string, optionIndex: number) => (
                  <Typography
                    key={optionIndex}
                    variant="body2"
                    sx={{ mb: 0.5 }}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </Typography>
                ))}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Chip
                label={`${question?.marks || 0} mark${
                  (question?.marks || 0) > 1 ? "s" : ""
                }`}
                size="small"
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {question?.answer && (
                  <Typography variant="caption" color="text.secondary">
                    Answer: {question.answer}
                  </Typography>
                )}
                <IconButton
                  size="small"
                  onClick={() =>
                    handleEditQuestion(sectionIndex, questionIndex, question)
                  }
                  sx={{ color: "primary.main" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header with Actions */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Generated Question Paper
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {paperData.metadata.board} Class {paperData.metadata.class_level} -{" "}
            {paperData.metadata.subject}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setReplaceDialogOpen(true)}
            disabled={selectedQuestions.length === 0}
          >
            Replace Questions ({selectedQuestions.length})
          </Button>
          <Button
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={() => setShowPrintableDialog(true)}
          >
            Question Paper
          </Button>
          <Button
            variant="contained"
            startIcon={generatingAnswerKey ? null : <DescriptionIcon />}
            onClick={handleGenerateAnswerKeyDialog}
            disabled={generatingAnswerKey}
          >
            {generatingAnswerKey ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Generating...
              </>
            ) : (
              "Answer Paper"
            )}
          </Button>
        </Box>
      </Box>

      {/* Paper Metadata */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Board:</strong> {paperData.metadata.board}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Class:</strong> {paperData.metadata.class_level}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Subject:</strong> {paperData.metadata.subject}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Chapters:</strong>{" "}
                {paperData.metadata.chapters.join(", ")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Difficulty:</strong> {paperData.metadata.difficulty}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Marks:</strong> {paperData.metadata.marks}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Instructions:</strong> Select questions you want to replace by
          checking the boxes, then click "Replace Selected" to generate new
          questions. Once satisfied, click "Generate Printable" to create a
          formatted version for printing/downloading.
        </Typography>
      </Alert>

      {/* Question Sections */}
      {paperData.sections.map((section, sectionIndex: number) => (
        <Card key={sectionIndex} sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Section {sectionIndex + 1}: {section.type}
              </Typography>
              <Chip label={`${section.total_marks} marks`} color="primary" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {section.questions.map(
              (question: Question, questionIndex: number) =>
                renderQuestion(question, sectionIndex, questionIndex)
            )}
          </CardContent>
        </Card>
      ))}

      {/* Replace Questions Dialog */}
      <Dialog
        open={replaceDialogOpen}
        onClose={() => setReplaceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Replace Selected Questions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You have selected {selectedQuestions.length} question(s) to replace.
            This will generate new questions with the same difficulty level and
            topic coverage.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Questions:
            </Typography>
            {selectedQuestions.map((sq, index) => (
              <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                • Section {sq.sectionIndex + 1}, Question {sq.questionIndex + 1}
                : {sq.question.question.substring(0, 50)}...
              </Typography>
            ))}
          </Box>

          {replacingQuestions && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Replacing questions...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReplaceDialogOpen(false)}
            disabled={replacingQuestions}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplaceSelectedQuestions}
            variant="contained"
            disabled={replacingQuestions}
            startIcon={
              replacingQuestions ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshIcon />
              )
            }
          >
            Replace Questions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Paper Printable Dialog */}
      <PrintablePaperView
        open={showPrintableDialog}
        onClose={() => setShowPrintableDialog(false)}
        paperData={paperData}
        schoolDetails={schoolDetails}
        onSchoolDetailsChange={setSchoolDetails}
      />

      {/* Answer Key Printable Dialog */}
      {answerKeyData && (
        <PrintablePaperView
          open={showAnswerKeyDialog}
          onClose={() => setShowAnswerKeyDialog(false)}
          paperData={answerKeyData}
          schoolDetails={schoolDetails}
          onSchoolDetailsChange={setSchoolDetails}
          isAnswerKey={true}
        />
      )}

      {/* Edit Question Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Question Text"
              value={editedQuestionText}
              onChange={(e) => setEditedQuestionText(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />

            {editingQuestion && hasOptions(editingQuestion.question) && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options:
                </Typography>
                <Stack spacing={1}>
                  {editedOptions.map((option, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ minWidth: "24px", fontWeight: "bold" }}
                      >
                        {String.fromCharCode(65 + index)}.
                      </Typography>
                      <TextField
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleDeleteOption(index)}
                        color="error"
                        size="small"
                        disabled={editedOptions.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
                    variant="outlined"
                    size="small"
                  >
                    Add Option
                  </Button>
                </Stack>
              </Box>
            )}

            <TextField
              label="Correct Answer"
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder={
                editingQuestion && hasOptions(editingQuestion.question)
                  ? "Enter the correct option (e.g., A, B, C, or D)"
                  : "Enter the correct answer"
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEditedQuestion}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!editedQuestionText.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionPaperDisplay;
