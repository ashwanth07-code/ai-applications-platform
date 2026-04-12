import React, { useState } from 'react';
import {
  Paper, Typography, TextField, Button, Box, Alert,
  Card, CardContent, LinearProgress, Chip, Grid,
  Tab, Tabs, IconButton, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const QA_System = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Local QA function (no backend needed)
  const findAnswer = (question, context) => {
    const questionLower = question.toLowerCase();
    const sentences = context.match(/[^.!?]+[.!?]+/g) || [context];
    
    // Extract key words from question
    const keywords = questionLower.split(' ').filter(word => word.length > 3);
    
    let bestSentence = '';
    let bestScore = 0;
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      let score = 0;
      keywords.forEach(keyword => {
        if (sentenceLower.includes(keyword)) {
          score++;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    });
    
    if (bestSentence) {
      return {
        answer: bestSentence.trim(),
        confidence: Math.min(0.5 + (bestScore / keywords.length) * 0.5, 0.95)
      };
    }
    
    return {
      answer: "I couldn't find a specific answer in the provided context. Please try rephrasing your question or providing more context.",
      confidence: 0.3
    };
  };

  const askQuestion = () => {
    if (!question.trim() || !context.trim()) {
      setError('Please enter both question and context');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      const result = findAnswer(question, context);
      
      setAnswer({
        success: true,
        answer: result.answer,
        confidence: result.confidence
      });
      
      setHistory(prev => [
        {
          id: Date.now(),
          question,
          answer: result.answer,
          confidence: result.confidence,
          timestamp: new Date().toLocaleString()
        },
        ...prev
      ]);
      
      setLoading(false);
    }, 500);
  };

  const loadSampleContext = () => {
    setContext(
      "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals. The term 'artificial intelligence' had previously been used to describe machines that mimic and display 'human' cognitive skills that are associated with the human mind, such as 'learning' and 'problem-solving'."
    );
    setQuestion("What is artificial intelligence?");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at 10% 20%, #1a1a2e, #16213e, #0f3460)',
      p: 3,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          height: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          background: 'linear-gradient(145deg, #1e1e2f, #2d2d44)',
          border: '1px solid #4a4a6a',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(90deg, #6a1b9a, #4a148c, #2a0e5c)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          borderBottom: '2px solid #9575cd'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={goToHome}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b, #f03e3e)',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f03e3e, #c92a2a)',
                }
              }}
            >
              Back to Home
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuestionAnswerIcon sx={{ fontSize: 28, color: '#ffd700' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                Q&A System
              </Typography>
              <Chip 
                label="Active" 
                size="small" 
                sx={{ 
                  background: 'linear-gradient(45deg, #00b09b, #96c93d)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          p: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1e1e2f 100%)',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#2d2d44',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(45deg, #6a1b9a, #9575cd)',
            borderRadius: '4px',
          },
        }}>
          
          <Box sx={{ borderBottom: 1, borderColor: '#4a4a6a', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              sx={{
                '& .MuiTab-root': { color: '#b0b0d0' },
                '& .Mui-selected': { color: '#ffd700' },
                '& .MuiTabs-indicator': { backgroundColor: '#ffd700' },
              }}
            >
              <Tab label="Ask Question" icon={<QuestionAnswerIcon />} iconPosition="start" />
              <Tab label="History" icon={<HistoryIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Your Question"
                  variant="outlined"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is artificial intelligence?"
                  disabled={loading}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#1e1e2f',
                      color: '#e0e0e0',
                      '& fieldset': { borderColor: '#4a4a6a' },
                      '&:hover fieldset': { borderColor: '#9575cd' },
                      '&.Mui-focused fieldset': { borderColor: '#6a1b9a', borderWidth: '2px' },
                    },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={askQuestion}
                    disabled={loading || !question.trim() || !context.trim()}
                    sx={{ 
                      flexGrow: 1,
                      background: 'linear-gradient(45deg, #6a1b9a, #4a148c)',
                      color: 'white',
                      '&:hover': { background: 'linear-gradient(45deg, #4a148c, #6a1b9a)' },
                    }}
                  >
                    {loading ? <LinearProgress sx={{ width: 100 }} /> : 'Ask Question'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={loadSampleContext}
                    sx={{
                      borderColor: '#9575cd',
                      color: '#9575cd',
                      '&:hover': { borderColor: '#6a1b9a', color: '#6a1b9a' }
                    }}
                  >
                    Sample
                  </Button>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(135deg, #c62828, #b71c1c)',
                      color: 'white',
                    }} 
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="Context Document"
                  variant="outlined"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste your document text here..."
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#1e1e2f',
                      color: '#e0e0e0',
                      '& fieldset': { borderColor: '#4a4a6a' },
                      '&:hover fieldset': { borderColor: '#9575cd' },
                      '&.Mui-focused fieldset': { borderColor: '#6a1b9a', borderWidth: '2px' },
                    },
                  }}
                  helperText="The AI will search for answers within this context"
                />
              </Grid>

              <Grid item xs={12}>
                {answer && answer.success && (
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #2d2d44, #1e1e2f)',
                    border: '1px solid #4a4a6a',
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#96c93d' }}>
                          Answer Found! ✅
                        </Typography>
                        <Tooltip title="Copy answer">
                          <IconButton 
                            onClick={() => copyToClipboard(answer.answer)} 
                            size="small"
                            sx={{ color: '#ffd700' }}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Paper sx={{ 
                        p: 3, 
                        background: '#1e1e2f',
                        mb: 2,
                        borderRadius: 1,
                        border: '1px solid #4a4a6a',
                        color: '#e0e0e0'
                      }}>
                        <Typography variant="body1">
                          {answer.answer}
                        </Typography>
                      </Paper>
                      
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Confidence: ${(answer.confidence * 100).toFixed(1)}%`}
                          sx={{
                            background: answer.confidence > 0.8 
                              ? 'linear-gradient(45deg, #00b09b, #96c93d)'
                              : answer.confidence > 0.5 
                                ? 'linear-gradient(45deg, #ffd700, #ffb300)'
                                : 'linear-gradient(45deg, #f093fb, #f5576c)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              {history.length > 0 ? (
                <Grid container spacing={2}>
                  {history.map((item) => (
                    <Grid item xs={12} key={item.id}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #2d2d44, #1e1e2f)',
                        border: '1px solid #4a4a6a',
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#b0b0d0' }}>
                              {item.timestamp}
                            </Typography>
                            <Chip 
                              size="small"
                              label={`${(item.confidence * 100).toFixed(1)}% confidence`}
                              sx={{
                                background: item.confidence > 0.8 
                                  ? 'linear-gradient(45deg, #00b09b, #96c93d)'
                                  : item.confidence > 0.5 
                                    ? 'linear-gradient(45deg, #ffd700, #ffb300)'
                                    : 'linear-gradient(45deg, #f093fb, #f5576c)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffd700' }}>
                            <strong>Q:</strong> {item.question}
                          </Typography>
                          <Typography variant="body1" paragraph sx={{ color: '#e0e0e0' }}>
                            <strong>A:</strong> {item.answer}
                          </Typography>
                          <Button 
                            size="small" 
                            startIcon={<ContentCopyIcon />}
                            onClick={() => copyToClipboard(item.answer)}
                            sx={{ color: '#9575cd' }}
                          >
                            Copy Answer
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info" sx={{ 
                  background: 'linear-gradient(135deg, #2d2d44, #1e1e2f)',
                  color: '#b0b0d0',
                  border: '1px solid #4a4a6a'
                }}>
                  No question history yet. Ask some questions to see them here!
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default QA_System;