import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
// @ts-ignore
import jsPDF from "jspdf";
import { PaperGenerationResponse, hasOptions, Question } from "../types/api";

interface PrintablePaperViewProps {
  paperData: PaperGenerationResponse;
  open: boolean;
  onClose: () => void;
  schoolDetails?: SchoolDetails;
  onSchoolDetailsChange?: (details: SchoolDetails) => void;
  isAnswerKey?: boolean;
}

interface SchoolDetails {
  schoolName: string;
  address: string;
  examType: string;
  academicYear: string;
  date: string;
  time: string;
  instructions: string;
}

const PrintablePaperView = ({
  paperData,
  open,
  onClose,
  schoolDetails: propSchoolDetails,
  onSchoolDetailsChange,
  isAnswerKey = false,
}: PrintablePaperViewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails>(
    propSchoolDetails || {
      schoolName: "ABC Public School",
      address: "123 Education Street, Knowledge City, State - 123456",
      examType: "Mid-Term Examination",
      academicYear: "2024-25",
      date: new Date().toLocaleDateString("en-IN"),
      time: "2 Hours",
      instructions:
        "• All questions are compulsory.\n• Read the questions carefully before answering.\n• Write your answers in the space provided.\n• Use blue or black ink only.\n• Check your answers before submitting.",
    }
  );

  // Sync schoolDetails with parent component
  useEffect(() => {
    if (propSchoolDetails) {
      setSchoolDetails(propSchoolDetails);
    }
  }, [propSchoolDetails]);

  // Notify parent of schoolDetails changes
  const handleSchoolDetailsChange = (newDetails: SchoolDetails) => {
    setSchoolDetails(newDetails);
    if (onSchoolDetailsChange) {
      onSchoolDetailsChange(newDetails);
    }
  };

  const handlePrint = () => {
    try {
      if (printRef.current) {
        // Create a new window for printing
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          // Get the content to print
          const printContent = `
            <div class="print-container">
              <div class="print-header">
                <div class="print-title">${schoolDetails.schoolName}</div>
                <div class="print-subtitle">${schoolDetails.address}</div>
                <div class="print-exam-type">${schoolDetails.examType}</div>
                
                <div class="print-details-row">
                  <span><strong>Academic Year:</strong> ${schoolDetails.academicYear}</span>
                  <span><strong>Date:</strong> ${schoolDetails.date}</span>
                  <span><strong>Time:</strong> ${schoolDetails.time}</span>
                </div>
                
                <div class="print-details-row">
                  <span><strong>Subject:</strong> ${paperData.metadata.subject}</span>
                  <span><strong>Class:</strong> ${paperData.metadata.class_level}</span>
                  <span><strong>Board:</strong> ${paperData.metadata.board}</span>
                  <span><strong>Total Marks:</strong> ${paperData.metadata.marks}</span>
                </div>
              </div>
              
              <div class="print-divider"></div>
              
              <div class="print-instructions">
                <div class="print-instructions-title">General Instructions:</div>
                <ul class="print-instructions-list">
                  ${schoolDetails.instructions.split('\n').map(instruction => 
                    instruction.trim() ? `<li>${instruction.trim()}</li>` : ''
                  ).join('')}
                </ul>
              </div>
              
              <div class="print-divider"></div>
              
              <div class="print-questions-title">${isAnswerKey ? 'ANSWERS' : 'QUESTIONS'}</div>
              
              ${paperData.sections.map((section, sectionIndex) => `
                <div class="print-section">
                  <div class="print-section-title">
                    Section ${sectionIndex + 1}: ${section.type}${isAnswerKey ? ' Answers' : ''} 
                    (${section.questions.length} × ${section.questions.length > 0 ? (section.total_marks / section.questions.length).toFixed(1) : 0} = ${section.total_marks} marks)
                  </div>
                  
                  ${section.questions.map((question, questionIndex) => `
                    <div class="print-question">
                      <div class="print-question-text">
                        <strong>Q${questionIndex + 1}.</strong> ${question.question}
                      </div>
                      
                      ${(() => {
                        const normalizedOptions = hasOptions(question) ? normalizeOptions(question.options) : [];
                        return normalizedOptions.length > 0 ? `
                        <div class="print-options">
                          ${normalizedOptions.map((option: string, optionIndex: number) => `
                            <div class="print-option">${String.fromCharCode(65 + optionIndex)}. ${option}</div>
                          `).join('')}
                        </div>
                      ` : '';
                      })()}
                      
                      ${isAnswerKey && question.answer ? `
                        <div class="print-answer">Answer: ${getAnswerText(question.answer)}</div>
                        <div class="print-marks">Marks: ${question.marks}</div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `;

          console.log('Print content generated:', printContent.substring(0, 500) + '...');
          console.log('Paper data sections:', paperData.sections.length);
          console.log('Is answer key:', isAnswerKey);
          console.log('First section questions:', paperData.sections[0]?.questions.length);

          // Write the content to the new window
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${isAnswerKey ? "Answer Key" : "Question Paper"}</title>
                  <style>
                    @page {
                      margin: 0.5in;
                      @top-left { content: ""; }
                      @top-right { content: ""; }
                      @bottom-left { content: ""; }
                      @bottom-right { content: ""; }
                    }
                    body { 
                      font-family: Arial, sans-serif; 
                      margin: 0;
                      padding: 0;
                      line-height: 1.4;
                      font-size: 12px;
                      color: #000;
                    }
                    .print-container {
                      max-width: 100%;
                      margin: 0 auto;
                      padding: 0;
                    }
                    .print-header { 
                      text-align: center; 
                      margin-bottom: 15px; 
                    }
                    .print-title { 
                      font-size: 20px; 
                      font-weight: bold; 
                      margin-bottom: 3px; 
                      color: #000;
                    }
                    .print-subtitle { 
                      font-size: 12px; 
                      margin-bottom: 6px; 
                      color: #000;
                    }
                    .print-exam-type { 
                      font-size: 16px; 
                      font-weight: bold; 
                      margin-bottom: 8px; 
                      color: #000;
                    }
                    .print-details-row { 
                      font-size: 11px; 
                      margin-bottom: 6px; 
                      display: flex;
                      justify-content: space-between;
                      color: #000;
                    }
                    .print-details-row strong {
                      font-weight: bold;
                    }
                    .print-instructions { 
                      border: 1px solid #ccc; 
                      padding: 6px; 
                      margin: 6px auto; 
                      max-width: 80%; 
                      text-align: center; 
                      background: #fff;
                    }
                    .print-instructions-title {
                      font-weight: bold;
                      margin-bottom: 3px;
                      font-size: 13px;
                    }
                    .print-instructions-list {
                      margin: 0;
                      padding: 0;
                      list-style: none;
                    }
                    .print-instructions-list li {
                      margin-bottom: 1px;
                      font-size: 11px;
                    }
                    .print-divider {
                      border-top: 1px solid #000;
                      margin: 8px 0;
                    }
                    .print-questions-title { 
                      font-size: 15px;
                      font-weight: bold;
                      margin: 12px 0 8px 0;
                      color: #000;
                    }
                    .print-section { 
                      margin-bottom: 16px; 
                    }
                    .print-section-title {
                      font-size: 14px;
                      font-weight: bold;
                      margin-bottom: 8px;
                      color: #000;
                    }
                    .print-question { 
                      margin-bottom: 12px; 
                    }
                    .print-question-text {
                      font-size: 12px;
                      margin-bottom: 6px;
                      color: #000;
                    }
                    .print-options {
                      margin-left: 16px;
                      margin-bottom: 6px;
                    }
                    .print-option {
                      font-size: 12px;
                      margin-bottom: 3px;
                      color: #000;
                    }
                    .print-answer {
                      font-weight: bold;
                      color: #1976d2;
                      margin-left: 20px;
                      font-size: 12px;
                    }
                    .print-marks {
                      color: #666;
                      margin-left: 20px;
                      font-size: 12px;
                    }
                    @media print {
                      body { 
                        margin: 0; 
                        padding: 0; 
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                      }
                      .print-header { 
                        page-break-inside: avoid; 
                        margin-bottom: 20px;
                      }
                      .print-instructions { 
                        page-break-inside: avoid; 
                        margin-bottom: 20px;
                      }
                      .print-questions-title {
                        margin-top: 20px;
                        margin-bottom: 15px;
                      }
                      .print-section { 
                        page-break-inside: avoid; 
                        margin-bottom: 20px;
                      }
                      @page {
                        margin: 0.5in;
                      }
                    }
                  </style>
              </head>
              <body>
                ${printContent}
              </body>
            </html>
          `);

          printWindow.document.close();

          // Wait for content to load, then print
          printWindow.onload = () => {
            printWindow.print();
            // Close the print window after printing
            printWindow.close();
          };
        } else {
          // Fallback to regular print if popup is blocked
          window.print();
        }
      }
    } catch (error) {
      console.error("Error printing:", error);
      alert("Failed to print. Please try again.");
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (printRef.current) {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageHeight = 297; // A4 height in mm
        const margin = 20;
        const contentWidth = 170;
        let yPos = 20;

        // Helper function to add new page if needed
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
        yPos += 8; // Reduced from 12

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(schoolDetails.address, 105, yPos, { align: "center" });
        yPos += 10; // Reduced from 15

        // Add exam details
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(schoolDetails.examType, 105, yPos, { align: "center" });
        yPos += 15; // Reduced from 20

        // Add exam details in a more structured way
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        // Three-column layout to match preview exactly
        pdf.text(`Academic Year: ${schoolDetails.academicYear}`, margin, yPos);
        pdf.text(`Date: ${schoolDetails.date}`, margin + 70, yPos);
        pdf.text(`Time: ${schoolDetails.time}`, margin + 140, yPos);

        yPos += 10;

        // Put Subject, Class, Board, Total Marks on same line
        pdf.text(`Subject: ${paperData.metadata.subject}`, margin, yPos);
        pdf.text(`Class: ${paperData.metadata.class_level}`, margin + 50, yPos);
        pdf.text(`Board: ${paperData.metadata.board}`, margin + 100, yPos);
        pdf.text(
          `Total Marks: ${paperData.metadata.marks}`,
          margin + 150,
          yPos
        );

        yPos += 10;

        // Add vertical line below
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 5; // Reduced from 10

        // Add instructions in a centered box
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");

        const instructions = schoolDetails.instructions.split("\n");
        const boxWidth = 120; // Width of the instruction box
        const boxPadding = 5; // Reduced from 8
        const boxHeight = instructions.length * 5 + 10 + boxPadding; // Reduced bottom padding
        const boxX = (210 - boxWidth) / 2; // Center the box (210mm is A4 width)
        const boxY = yPos;

        // Draw the box
        pdf.setLineWidth(0.5);
        pdf.rect(boxX, boxY, boxWidth, boxHeight);

        // Add "General Instructions:" header
        pdf.text(
          "General Instructions:",
          boxX + boxPadding,
          boxY + boxPadding + 2
        );

        // Add instructions with bullet points
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        instructions.forEach((instruction, index) => {
          checkPageBreak(5);
          pdf.text(
            instruction,
            boxX + boxPadding,
            boxY + boxPadding + 7 + index * 5
          );
        });

        yPos += boxHeight + 12; // Increased gap from 8 to 12

        // Add questions
        checkPageBreak(15);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(isAnswerKey ? "ANSWERS" : "QUESTIONS", margin, yPos);
        yPos += 12;

        paperData.sections.forEach((section, sectionIndex: number) => {
          // Section header with marks calculation
          checkPageBreak(12);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");

          // Calculate marks per question
          const questionsCount = section.questions.length;
          const totalMarks = section.total_marks;
          const marksPerQuestion =
            questionsCount > 0 ? Number((totalMarks / questionsCount).toFixed(1)) : 0;

          pdf.text(
            `Section ${sectionIndex + 1}: ${section.type} ${
              isAnswerKey ? "Answers" : ""
            } (${questionsCount} × ${marksPerQuestion} = ${totalMarks} marks)`,
            margin,
            yPos
          );
          yPos += 10;

          // Questions
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          section.questions.forEach(
            (question: Question, questionIndex: number) => {
              const questionText = `Q${questionIndex + 1}. ${
                question.question
              }`;
              const lines = pdf.splitTextToSize(
                questionText,
                contentWidth - 10
              );

              // Check if we need a new page for the question
              checkPageBreak(lines.length * 5 + 20);

              lines.forEach((line: string) => {
                pdf.text(line, margin + 5, yPos);
                yPos += 5;
              });

              const normalizedOptions = hasOptions(question) ? normalizeOptions(question.options) : [];
              if (normalizedOptions.length > 0) {
                normalizedOptions.forEach(
                  (option: string, optionIndex: number) => {
                    const optionText = `${String.fromCharCode(
                      65 + optionIndex
                    )}. ${option}`;
                    const optionLines = pdf.splitTextToSize(
                      optionText,
                      contentWidth - 15
                    );

                    checkPageBreak(optionLines.length * 6);

                    optionLines.forEach((line: string) => {
                      pdf.text(line, margin + 15, yPos);
                      yPos += 6;
                    });
                  }
                );
              }

              // Show answer if it's an answer key
              if (isAnswerKey && question.answer) {
                checkPageBreak(12);
                pdf.setFont("helvetica", "bold");
                const answerText = `Answer: ${getAnswerText(question.answer)}`;
                const answerLines = pdf.splitTextToSize(
                  answerText,
                  contentWidth - 10
                );

                answerLines.forEach((line: string) => {
                  pdf.text(line, margin + 10, yPos);
                  yPos += 5;
                });

                yPos += 3;
                pdf.setFont("helvetica", "normal");
                pdf.text(`Marks: ${question.marks}`, margin + 10, yPos);
                yPos += 8;
              }

              // No individual marks display for questions - marks are shown in section title
              yPos += 8;

              // Reset font
              pdf.setFontSize(11);
              pdf.setFont("helvetica", "normal");
            }
          );

          yPos += 8; // Space between sections
        });

        // Save the PDF
        pdf.save(
          `${schoolDetails.examType}_${paperData.metadata.subject}_Class${paperData.metadata.class_level}.pdf`
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Helper to extract answer text from various formats
  const getAnswerText = (answer: any): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    if (typeof answer === 'object' && answer !== null) {
      // Check for common answer formats
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
      if (answer.correct_word) {
        return answer.correct_word;
      }
      
      // For complex objects (like the JSON structures from AI),
      // extract meaningful text based on the structure
      if (answer.final_answer) {
        return answer.final_answer;
      }
      if (answer.type && answer.explanation) {
        // Return a simplified version
        return `${answer.type}: ${answer.explanation.substring(0, 100)}...`;
      }
      if (answer.definition || answer.definitions) {
        const def = answer.definition || (answer.definitions && answer.definitions[0]);
        if (def) {
          if (typeof def === 'string') return def;
          if (def.term && def.explanation) {
            return `${def.term}: ${def.explanation.substring(0, 80)}...`;
          }
        }
      }
      
      // Last resort: return a generic message
      return "Answer provided (see details)";
    }
    return String(answer);
  };

  // Helper to normalize options (handle both array and object formats)
  const normalizeOptions = (options: any): string[] => {
    if (!options) return [];
    
    // If it's already an array, return it
    if (Array.isArray(options)) {
      return options.map(opt => typeof opt === 'string' ? opt : String(opt));
    }
    
    // If it's an object like {A: "text", B: "text"}, convert to array
    if (typeof options === 'object') {
      // Try to get values in order (A, B, C, D)
      const orderedKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
      const result: string[] = [];
      
      for (const key of orderedKeys) {
        if (options[key]) {
          result.push(String(options[key]));
        }
      }
      
      // If no ordered keys found, just get all values
      if (result.length === 0) {
        return Object.values(options).map(val => String(val));
      }
      
      return result;
    }
    
    return [];
  };

  const renderQuestion = (question: Question, questionIndex: number) => {
    // Normalize options to handle both array and object formats
    const normalizedOptions = hasOptions(question) ? normalizeOptions(question.options) : [];
    
    return (
      <Box key={questionIndex} sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Q{questionIndex + 1}.</strong> {question.question}
        </Typography>

        {normalizedOptions.length > 0 && (
          <Box sx={{ ml: 2, mb: 1 }}>
            {normalizedOptions.map((option: string, optionIndex: number) => {
              // Only highlight correct answer if this is an answer key
              const isCorrect = isAnswerKey && option === getAnswerText(question.answer);
              return (
                <Typography 
                  key={optionIndex} 
                  variant="body2" 
                  sx={{ 
                    mb: 0.5,
                    fontWeight: isCorrect ? 'bold' : 'normal',
                    color: isCorrect ? 'success.main' : 'text.primary'
                  }}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option} {isCorrect ? '✓' : ''}
                </Typography>
              );
            })}
          </Box>
        )}

        {isAnswerKey && question.answer && (
          <Box sx={{ ml: 2, mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Answer: {getAnswerText(question.answer)}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Marks: {question.marks}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {isAnswerKey ? "Printable Answer Key" : "Printable Question Paper"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* School Details Form */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <SchoolIcon />
                  School Details
                </Typography>

                <TextField
                  fullWidth
                  label="School Name"
                  value={schoolDetails.schoolName}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Address"
                  value={schoolDetails.address}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Exam Type"
                  value={schoolDetails.examType}
                  onChange={(e) =>
                    handleSchoolDetailsChange({
                      ...schoolDetails,
                      examType: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Academic Year"
                  value={schoolDetails.academicYear}
                  onChange={(e) =>
                    handleSchoolDetailsChange({
                      ...schoolDetails,
                      academicYear: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Date"
                  value={schoolDetails.date}
                  onChange={(e) =>
                    handleSchoolDetailsChange({
                      ...schoolDetails,
                      date: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Time Duration"
                  value={schoolDetails.time}
                  onChange={(e) =>
                    handleSchoolDetailsChange({
                      ...schoolDetails,
                      time: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Instructions"
                  multiline
                  rows={4}
                  value={schoolDetails.instructions}
                  onChange={(e) =>
                    handleSchoolDetailsChange({
                      ...schoolDetails,
                      instructions: e.target.value,
                    })
                  }
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Printable Paper Preview */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{ border: "1px solid #ddd", p: 3, bgcolor: "white" }}
              ref={printRef}
            >
              {/* School Header */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  {schoolDetails.schoolName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {schoolDetails.address}
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1.5 }}>
                  {schoolDetails.examType}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Academic Year:</strong> {schoolDetails.academicYear}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {schoolDetails.date}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {schoolDetails.time}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Subject:</strong> {paperData.metadata.subject}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Class:</strong> {paperData.metadata.class_level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Board:</strong> {paperData.metadata.board}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Marks:</strong> {paperData.metadata.marks}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 1 }} />

              {/* Instructions */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                    maxWidth: "80%",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    General Instructions:
                  </Typography>
                  {schoolDetails.instructions
                    .split("\n")
                    .map((instruction, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.25 }}>
                        {instruction}
                      </Typography>
                    ))}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Questions or Answers */}
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                {isAnswerKey ? "ANSWERS" : "QUESTIONS"}
              </Typography>

              {paperData.sections.map((section, sectionIndex: number) => (
                <Box key={sectionIndex} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Section {sectionIndex + 1}: {section.type}{" "}
                    {isAnswerKey ? "Answers" : ""} ({section.questions.length} ×{" "}
                    {section.questions.length > 0
                      ? (section.total_marks / section.questions.length).toFixed(1)
                      : 0}{" "}
                    = {section.total_marks} marks)
                  </Typography>

                  {section.questions.map(
                    (question: Question, questionIndex: number) =>
                      renderQuestion(question, questionIndex)
                  )}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintablePaperView;
