import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  MenuBook,
  AutoAwesome,
  Download,
  Refresh,
  School,
  Psychology,
  Assessment,
  Quiz,
  Visibility,
  Delete,
  CalendarToday,
  Subject,
  Grade,
  Description,
} from "@mui/icons-material";
import PaperStorageService, { SavedPaper } from "../services/storage";
import toast from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSavedPapers();
  }, []);

  const loadSavedPapers = () => {
    const papers = PaperStorageService.getAllPapers();
    setSavedPapers(papers);
  };

  const handleViewPaper = (paperId: string) => {
    navigate(`/paper/${paperId}`);
  };

  const handleViewAnswerKey = (paperId: string) => {
    navigate(`/answer-key/${paperId}`);
  };

  const handleDeletePaper = (paperId: string) => {
    setPaperToDelete(paperId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePaper = () => {
    if (paperToDelete) {
      const success = PaperStorageService.deletePaper(paperToDelete);
      if (success) {
        toast.success("Paper deleted successfully!");
        loadSavedPapers();
      } else {
        toast.error("Failed to delete paper");
      }
    }
    setDeleteDialogOpen(false);
    setPaperToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalQuestions = (sections: any[]) => {
    return sections.reduce((total, section) => total + section.questions.length, 0);
  };

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "primary.main",
            mx: "auto",
            mb: 3,
          }}
        >
          <MenuBook sx={{ fontSize: 40 }} />
        </Avatar>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          AI Question Paper Generator
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 800, mx: "auto" }}
        >
          Generate high-quality question papers for CBSE, ICSE, and SSC boards
          using advanced AI technology. Create customized papers with multiple
          question types and difficulty levels.
        </Typography>

        <Button
          component={Link}
          to="/generate"
          variant="contained"
          size="large"
          startIcon={<AutoAwesome />}
          sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
        >
          Generate Question Paper
        </Button>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 2 }}>
                <School />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Multi-Board Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate papers following CBSE, ICSE, and SSC curriculum
                standards with board-specific question patterns.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 2 }}>
                <Psychology />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Flexible Question Types
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create MCQ, Fill in the Blanks, Short Answer, Medium, and Long
                Answer questions with customizable distributions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 2 }}>
                <Download />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Download & Print
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Download question papers and answer keys in PDF format, ready
                for printing and distribution.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* How it Works */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ textAlign: "center", mb: 4 }}
        >
          How It Works
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              step: 1,
              title: "Configure",
              description:
                "Select board, class, subject, chapters, and question distribution",
            },
            {
              step: 2,
              title: "Generate",
              description:
                "AI creates questions following curriculum standards",
            },
            {
              step: 3,
              title: "Review",
              description: "Review and replace questions as needed",
            },
            {
              step: 4,
              title: "Download",
              description: "Download question paper and answer key",
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.step}>
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "primary.main",
                    mx: "auto",
                    mb: 2,
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.step}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Papers */}
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2">
            Recent Papers
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={loadSavedPapers}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {savedPapers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Assessment sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No papers generated yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first question paper to get started!
            </Typography>
            <Button
              component={Link}
              to="/generate"
              variant="contained"
              startIcon={<AutoAwesome />}
            >
              Generate Your First Paper
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 3,
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            {savedPapers.map((paper) => (
              <Card
                key={paper.id}
                sx={{
                  minWidth: 320,
                  maxWidth: 320,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {paper.title}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={paper.metadata.board}
                      size="small"
                      color="primary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={`Class ${paper.metadata.class_level}`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={`${paper.metadata.marks} marks`}
                      size="small"
                      color="success"
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Subject sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {paper.metadata.subject}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Quiz sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {getTotalQuestions(paper.sections)} questions
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(paper.created_at)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Chapters: {paper.metadata.chapters.join(', ')}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                  <Button
                    startIcon={<Visibility />}
                    onClick={() => handleViewPaper(paper.id)}
                    variant="contained"
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    View Question Paper
                  </Button>
                  {/* <Button
                    startIcon={<Description />}
                    onClick={() => handleViewAnswerKey(paper.id)}
                    variant="outlined"
                    size="small"
                  >
                    View Answer Key
                  </Button> */}
                  {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}> */}
                    <IconButton
                      onClick={() => handleDeletePaper(paper.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  {/* </Box> */}
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Paper</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this paper? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeletePaper} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
