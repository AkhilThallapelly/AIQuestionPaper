import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Slider,
} from "@mui/material";
import {
  Add,
  Remove,
  Settings,
  AutoAwesome,
  Refresh,
} from "@mui/icons-material";
import { generatePaper, generateAnswerKey } from "../services/api";
import PaperStorageService from "../services/storage";
import {
  BoardType,
  PaperGenerationRequest,
  PaperGenerationResponse,
  Question,
} from "../types/api";
import {
  EDUCATION_BOARDS,
  CLASS_LEVELS,
  SUBJECTS,
  QUESTION_TYPES,
  DEFAULT_FORM_VALUES,
  VALIDATION_RULES,
  UI_CONFIG,
} from "../constants";
import QuestionPaperDisplay from "../components/QuestionPaperDisplay";
import PrintablePaperView from "../components/PrintablePaperView";

const PaperGenerator = () => {
  const navigate = useNavigate();
  const { schoolData } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] =
    useState<PaperGenerationResponse | null>(null);
  // const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPaperDisplay, setShowPaperDisplay] = useState(false);
  const [showPrintableDialog, setShowPrintableDialog] = useState(false);
  const [formStateRestored, setFormStateRestored] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaperGenerationRequest>({
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      board: (schoolData?.board as BoardType) || DEFAULT_FORM_VALUES.board,
    },
  });

  const watchedValues = watch();

  // Form state persistence
  useEffect(() => {
    const savedFormState = localStorage.getItem('paperGeneratorFormState');
    if (savedFormState) {
      try {
        const parsedState = JSON.parse(savedFormState);
        
        // Override board with school's board - board should always come from school data
        if (schoolData?.board) {
          parsedState.board = schoolData.board;
        }
        
        // Ensure numeric values are properly typed
        if (parsedState.difficulty_percentage) {
          parsedState.difficulty_percentage = Number(parsedState.difficulty_percentage);
        }
        if (parsedState.total_marks) {
          parsedState.total_marks = Number(parsedState.total_marks);
        }
        
        // Ensure distribution values are numbers
        if (parsedState.distribution) {
          Object.keys(parsedState.distribution).forEach(key => {
            if (typeof parsedState.distribution[key] === 'string') {
              parsedState.distribution[key] = Number(parsedState.distribution[key]);
            }
          });
        }
        
        reset(parsedState);
        setFormStateRestored(true);
        console.log('Form state restored from localStorage');
        
        // Hide the notification after 3 seconds
        setTimeout(() => setFormStateRestored(false), 3000);
      } catch (error) {
        console.error('Failed to parse saved form state:', error);
        localStorage.removeItem('paperGeneratorFormState');
      }
    }
  }, [reset, schoolData]);

  // Set the board to school's board when school data is available
  // Board should always be set from school data, not from saved state
  useEffect(() => {
    if (schoolData?.board) {
      setValue('board', schoolData.board as BoardType);
    }
  }, [schoolData, setValue]);

  // Save form state whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('paperGeneratorFormState', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    try {
      // Validate required fields
      if (
        !data.board ||
        !data.class_level ||
        !data.subject ||
        !data.chapters ||
        data.chapters.length === 0
      ) {
        throw new Error(
          "Please fill in all required fields (Board, Class, Subject, and at least one Chapter)"
        );
      }

      // Convert distribution values to numbers (ensure both count and marks are numbers)
      const sanitizedDistribution: any = {};
      Object.entries(data.distribution).forEach(([key, value]) => {
        sanitizedDistribution[key] =
          value === "" || value === undefined ? 0 : Number(value);
      });

      // Ensure output_type is always included
      const requestData: PaperGenerationRequest = {
        ...data,
        output_type: "question_paper" as const,
        distribution: sanitizedDistribution,
        total_marks: Number(data.total_marks),
        difficulty_percentage: Number(data.difficulty_percentage),
      };

      console.log("Submitting paper generation request:", requestData);
      const response = await generatePaper(requestData);
      console.log("Paper generation response:", response);
      
      // Save paper to localStorage
      PaperStorageService.savePaper(response);
      
      setGeneratedPaper(response);
      setShowPaperDisplay(true);
      toast.success("Question paper generated and saved successfully!");
    } catch (error: any) {
      console.error("Paper generation error:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to generate question paper. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnswerKey = async () => {
    if (!generatedPaper?.paper_id) {
      toast.error("No paper available to generate answer key for.");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("Generating answer key for paper:", generatedPaper.paper_id);
      const answerKey = await generateAnswerKey(generatedPaper.paper_id);
      console.log("Answer key generated successfully:", answerKey);

      // Navigate to answer key viewer
      navigate(`/answer-key/${generatedPaper.paper_id}`);
      toast.success("Answer key generated successfully!");
    } catch (error: any) {
      console.error("Error generating answer key:", error);
      const errorMessage =
        error?.message || "Failed to generate answer key. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewPaper = () => {
    if (generatedPaper?.paper_id) {
      navigate(`/paper/${generatedPaper.paper_id}`);
    }
  };

  const handleQuestionReplace = (
    sectionIndex: number,
    questionIndex: number,
    newQuestion: Question
  ) => {
    if (generatedPaper) {
      const updatedPaper = { ...generatedPaper };
      updatedPaper.sections[sectionIndex].questions[questionIndex] =
        newQuestion;
      setGeneratedPaper(updatedPaper);
    }
  };

  const handleGeneratePrintable = (paperData: PaperGenerationResponse) => {
    setShowPrintableDialog(true);
  };

  const addChapter = () => {
    const currentChapters = watchedValues.chapters || [];
    if (currentChapters.length < UI_CONFIG.maxChapters) {
      const newChapter = String(currentChapters.length + 1);
      setValue("chapters", [...currentChapters, newChapter]);
    }
  };

  const removeChapter = (index: number) => {
    const currentChapters = watchedValues.chapters || [];
    if (currentChapters.length > UI_CONFIG.minChapters) {
      setValue(
        "chapters",
        currentChapters.filter((_, i) => i !== index)
      );
    }
  };

  const updateChapter = (index: number, value: string) => {
    const currentChapters = watchedValues.chapters || [];
    const newChapters = [...currentChapters];
    newChapters[index] = value;
    setValue("chapters", newChapters);
  };

  return (
    <Container maxWidth="lg">
      {!showPaperDisplay ? (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: "bold" }}
              >
                Generate Question Paper
              </Typography>
              {/* <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button> */}
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Form State Restored Notification */}
              {formStateRestored && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Form values restored from your previous session
                </Alert>
              )}
              
              {/* Basic Configuration */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.board}>
                    <InputLabel>Education Board</InputLabel>
                    <Select
                      {...register("board", { required: "Board is required" })}
                      value={watchedValues.board || DEFAULT_FORM_VALUES.board}
                      label="Education Board"
                    >
                      {EDUCATION_BOARDS.map((board) => {
                        const isDisabled = schoolData?.board ? schoolData.board !== board.value : false;
                        return (
                          <MenuItem 
                            key={board.value} 
                            value={board.value}
                            disabled={isDisabled}
                          >
                            {board.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {errors.board && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {errors.board.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.class_level}>
                    <InputLabel>Class Level</InputLabel>
                    <Select
                      {...register("class_level", {
                        required: "Class level is required",
                      })}
                      value={watchedValues.class_level || DEFAULT_FORM_VALUES.class_level}
                      label="Class Level"
                    >
                      {CLASS_LEVELS.map((classLevel) => (
                        <MenuItem
                          key={classLevel.value}
                          value={classLevel.value}
                        >
                          {classLevel.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.class_level && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {errors.class_level.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.subject}>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      {...register("subject", {
                        required: "Subject is required",
                      })}
                      value={watchedValues.subject || DEFAULT_FORM_VALUES.subject}
                      label="Subject"
                    >
                      {SUBJECTS.map((subject) => (
                        <MenuItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.subject && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {errors.subject.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              {/* Chapters */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chapters
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {watchedValues.chapters?.map((chapter, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <TextField
                        value={chapter}
                        onChange={(e) => updateChapter(index, e.target.value)}
                        placeholder={`Chapter ${index + 1}`}
                        sx={{ flexGrow: 1 }}
                      />
                      {watchedValues.chapters.length > 1 && (
                        <IconButton
                          onClick={() => removeChapter(index)}
                          color="error"
                        >
                          <Remove />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addChapter}
                    disabled={
                      watchedValues.chapters?.length >= UI_CONFIG.maxChapters
                    }
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Add Chapter
                    {watchedValues.chapters?.length >= UI_CONFIG.maxChapters &&
                      ` (Max: ${UI_CONFIG.maxChapters})`}
                  </Button>
                </Box>
              </Box>

              {/* Total Marks and Difficulty */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register("total_marks", {
                      required: "Total marks is required",
                      min: {
                        value: VALIDATION_RULES.total_marks.min,
                        message: `Minimum marks is ${VALIDATION_RULES.total_marks.min}`,
                      },
                      max: {
                        value: VALIDATION_RULES.total_marks.max,
                        message: `Maximum marks is ${VALIDATION_RULES.total_marks.max}`,
                      },
                    })}
                    label="Total Marks"
                    type="number"
                    placeholder="50"
                    fullWidth
                    error={!!errors.total_marks}
                    helperText={errors.total_marks?.message}
                    inputProps={{
                      min: VALIDATION_RULES.total_marks.min,
                      max: VALIDATION_RULES.total_marks.max,
                      step: 1
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ px: 2 }}>
                    <Typography gutterBottom>
                      Difficulty Level:{" "}
                      {Number(watchedValues.difficulty_percentage) ||
                        DEFAULT_FORM_VALUES.difficulty_percentage}
                      %
                    </Typography>
                    <Slider
                      {...register("difficulty_percentage")}
                      value={
                        Number(watchedValues.difficulty_percentage) ||
                        DEFAULT_FORM_VALUES.difficulty_percentage
                      }
                      onChange={(_, value) =>
                        setValue("difficulty_percentage", value as number)
                      }
                      min={VALIDATION_RULES.difficulty_percentage.min}
                      max={VALIDATION_RULES.difficulty_percentage.max}
                      step={5}
                      marks={[
                        { value: 10, label: "10%" },
                        { value: 50, label: "50%" },
                        { value: 100, label: "100%" },
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Question Distribution */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Question Distribution
                </Typography>
                <Grid container spacing={2}>
                  {QUESTION_TYPES.map(({ key, label, countKey, marksKey }) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {label}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <TextField
                              {...register(`distribution.${countKey}` as any, {
                                min: 0,
                              })}
                              label="Count"
                              type="number"
                              size="small"
                              fullWidth
                              inputProps={{
                                min: 0,
                                step: 1
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              {...register(`distribution.${marksKey}` as any, {
                                min: 0,
                              })}
                              label="Marks"
                              type="number"
                              size="small"
                              fullWidth
                              inputProps={{
                                min: 0,
                                step: 0.1
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Generate Button */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    // Clear form but preserve school's board
                    const clearedValues: PaperGenerationRequest = {
                      ...DEFAULT_FORM_VALUES,
                      board: (schoolData?.board as BoardType) || DEFAULT_FORM_VALUES.board,
                    };
                    reset(clearedValues);
                    localStorage.removeItem('paperGeneratorFormState');
                    toast.success("Form cleared to default values");
                  }}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isGenerating}
                  startIcon={
                    isGenerating ? (
                      <CircularProgress size={20} />
                    ) : (
                      <AutoAwesome />
                    )
                  }
                  sx={{ px: 4, py: 1.5 }}
                >
                  {isGenerating ? "Generating..." : "Generate Question Paper"}
                </Button>
              </Box>
            </form>

            {/* Generated Paper Actions */}
            {/* {generatedPaper && (
              <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="h6" gutterBottom>
                  Generated Paper
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Question paper generated successfully! Paper ID:{" "}
                  {generatedPaper.paper_id}
                </Alert>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Settings />}
                    onClick={() => setShowPaperDisplay(true)}
                  >
                    View Paper
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={
                      isGenerating ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Refresh />
                      )
                    }
                    onClick={handleGenerateAnswerKey}
                    disabled={isGenerating}
                  >
                    Generate Answer Key
                  </Button>
                </Box>
              </Box>
            )} */}
          </CardContent>
        </Card>
      ) : (
        generatedPaper && (
          <Box>
            <Button
              variant="outlined"
              onClick={() => setShowPaperDisplay(false)}
              sx={{ mb: 2 }}
            >
              ← Back to Generator
            </Button>
            <QuestionPaperDisplay
              paperData={generatedPaper}
              onQuestionReplace={handleQuestionReplace}
              onGeneratePrintable={handleGeneratePrintable}
            />
          </Box>
        )
      )}

      {/* Printable Paper Dialog */}
      {generatedPaper && (
        <PrintablePaperView
          paperData={generatedPaper}
          open={showPrintableDialog}
          onClose={() => setShowPrintableDialog(false)}
        />
      )}
    </Container>
  );
};

export default PaperGenerator;
