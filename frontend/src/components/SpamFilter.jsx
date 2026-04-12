import React, { useState } from 'react';
import {
  Paper, Typography, TextField, Button, Box, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Card, CardContent, Grid, LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

const SpamFilter = () => {
  const navigate = useNavigate();
  const [emailContent, setEmailContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  // Comprehensive spam detection function
  const detectSpam = (email) => {
    const emailLower = email.toLowerCase();
    
    // Extensive spam keyword list
    const spamKeywords = [
      // Prize/Money related
      'win', 'winner', 'won', 'prize', 'cash', 'money', 'million', 'billion', 'dollar',
      'lottery', 'jackpot', 'reward', 'gift', 'gift card', 'free gift', 'claim',
      'congratulations', 'selected', 'chosen', 'lucky', 'fortune',
      
      // Urgency/Pressure
      'urgent', 'immediate', 'act now', 'limited time', 'expires', 'deadline',
      'hurry', 'don\'t miss', 'last chance', 'final notice', 'warning',
      
      // Financial/Banking
      'bank', 'account', 'verify', 'verification', 'secure', 'security',
      'update your account', 'confirm', 'login', 'password', 'credit card',
      'debit card', 'ssn', 'social security', 'routing number', 'paypal',
      
      // Offers/Deals
      'offer', 'special offer', 'exclusive', 'discount', 'deal', 'bargain',
      'save big', 'best price', 'lowest price', 'cheap', 'affordable',
      
      // Business/Work
      'work from home', 'make money', 'earn', 'extra income', 'passive income',
      'financial freedom', 'rich', 'wealth', 'business opportunity',
      'investment', 'profit', 'return', 'guaranteed',
      
      // Health/Medical
      'weight loss', 'diet', 'pill', 'medicine', 'cure', 'treatment',
      'herbal', 'natural remedy', 'doctors', 'medical', 'health',
      
      // Romance/Relationships
      'single', 'dating', 'romance', 'love', 'meet singles', 'relationship',
      
      // Common spam phrases
      'click here', 'subscribe', 'unsubscribe', 'opt out', 'privacy policy',
      'terms and conditions', 'no cost', 'no fee', 'risk free',
      'satisfaction guaranteed', '100% satisfied', 'money back guarantee',
      
      // Suspicious senders
      'nigerian', 'prince', 'attorney', 'lawyer', 'inheritance',
      'funds transfer', 'wire transfer', 'western union',
      
      // Technical
      'virus', 'malware', 'trojan', 'hack', 'hacker', 'crack',
      'keylogger', 'spyware', 'ransomware',
      
      // Cryptocurrency
      'bitcoin', 'crypto', 'cryptocurrency', 'blockchain', 'mining',
      'ethereum', 'dogecoin', 'nft', 'token',
      
      // Work from home scams
      'data entry', 'envelope stuffing', 'assembly work', 'craft work',
      'paid surveys', 'mystery shopper', 'freelance',
      
      // Phishing indicators
      'verify your identity', 'confirm your details', 'update your information',
      'suspended', 'locked', 'restricted', 'unusual activity',
      'unauthorized', 'fraud alert', 'security breach'
    ];
    
    // Common legitimate email patterns (to reduce false positives)
    const legitimatePatterns = [
      'newsletter', 'news letter', 'weekly digest', 'monthly update',
      'receipt', 'order confirmation', 'shipping confirmation',
      'tracking number', 'delivery update',
      'password reset', 'account recovery',
      'meeting invitation', 'calendar invite',
      'team meeting', 'project update',
      'invoice', 'bill', 'payment received',
      'subscription', 'renewal', 'welcome',
      'thank you for your purchase', 'your order',
      'customer support', 'help desk', 'ticket'
    ];
    
    // Calculate spam score
    let spamScore = 0;
    let keywordMatches = [];
    
    // Check for spam keywords
    spamKeywords.forEach(keyword => {
      if (emailLower.includes(keyword)) {
        spamScore += 0.15; // Each keyword adds 15% to spam score
        keywordMatches.push(keyword);
      }
    });
    
    // Check for ALL CAPS words (spammy behavior)
    const words = email.split(' ');
    const allCapsWords = words.filter(word => 
      word.length > 3 && word === word.toUpperCase() && /[A-Z]/.test(word)
    );
    spamScore += allCapsWords.length * 0.1;
    
    // Check for excessive exclamation marks
    const exclamationCount = (email.match(/!/g) || []).length;
    spamScore += exclamationCount * 0.05;
    
    // Check for excessive question marks
    const questionCount = (email.match(/\?/g) || []).length;
    spamScore += questionCount * 0.03;
    
    // Check for dollar signs (money talk)
    const dollarCount = (email.match(/\$/g) || []).length;
    spamScore += dollarCount * 0.1;
    
    // Check for multiple links (spam often has many links)
    const linkCount = (email.match(/https?:\/\/[^\s]+/g) || []).length;
    spamScore += linkCount * 0.1;
    
    // Check for HTML content (spam often uses HTML)
    if (email.includes('<html') || email.includes('<body') || email.includes('<div')) {
      spamScore += 0.2;
    }
    
    // Check for misspelled words (common in spam to bypass filters)
    const commonMisspellings = [
      'viagra', 'cialis', 'pharmacy', 'prescription', 'meds',
      'refinance', 'mortgage', 'loan', 'debt', 'credit'
    ];
    commonMisspellings.forEach(word => {
      if (emailLower.includes(word)) {
        spamScore += 0.2;
      }
    });
    
    // Reduce score for legitimate patterns
    legitimatePatterns.forEach(pattern => {
      if (emailLower.includes(pattern)) {
        spamScore -= 0.3; // Reduce spam score for legitimate content
      }
    });
    
    // Ensure score is between 0 and 1
    spamScore = Math.min(Math.max(spamScore, 0), 1);
    
    // Determine if spam (threshold can be adjusted)
    const isSpam = spamScore > 0.4;
    
    // Calculate confidence based on how clear the decision is
    let confidence;
    if (isSpam) {
      confidence = 0.5 + (spamScore * 0.5); // Higher spam score = higher confidence
    } else {
      confidence = 1 - (spamScore * 0.5); // Lower spam score = higher confidence
    }
    confidence = Math.min(Math.max(confidence, 0.5), 0.99);
    
    return {
      isSpam,
      confidence,
      spamScore,
      keywordMatches: keywordMatches.slice(0, 5), // Top 5 matches
      allCapsCount: allCapsWords.length,
      exclamationCount,
      linkCount
    };
  };

  const checkSpam = async () => {
    if (!emailContent.trim()) {
      setError('Please enter email content');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // First try to use backend if available
      let response;
      try {
        response = await axios.post('http://localhost:5000/api/spam-check', {
          email: emailContent
        });
      } catch (backendError) {
        console.log('Backend not available, using local detection');
        // If backend fails, use local detection
        const localResult = detectSpam(emailContent);
        response = { data: localResult };
      }

      setResult(response.data);
      
      // Add to history
      setHistory(prev => [
        {
          id: Date.now(),
          email: emailContent.substring(0, 100) + (emailContent.length > 100 ? '...' : ''),
          result: response.data.isSpam ? 'Spam' : 'Ham',
          confidence: response.data.confidence,
          spamScore: response.data.spamScore,
          timestamp: new Date().toLocaleString(),
          keywordMatches: response.data.keywordMatches || []
        },
        ...prev
      ]);
    } catch (err) {
      setError('Failed to check email. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEmailContent(e.target.result);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const clearAll = () => {
    setEmailContent('');
    setResult(null);
    setFile(null);
    setError('');
  };

  const removeFromHistory = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const goToHome = () => {
    navigate('/');
  };

  // Sample spam email for testing
  const loadSpamSample = () => {
    setEmailContent(
      "URGENT: You have won $1,000,000! \n\n" +
      "Congratulations! You have been selected as the winner of our international lottery! " +
      "To claim your prize of ONE MILLION DOLLARS, please click the link below and verify your account information within 24 hours.\n\n" +
      "http://fake-link.com/claim-your-prize\n\n" +
      "This is a limited time offer! Don't miss out on this life-changing opportunity!\n\n" +
      "Best regards,\n" +
      "International Lottery Commission"
    );
  };

  // Sample legitimate email for testing
  const loadHamSample = () => {
    setEmailContent(
      "Subject: Team Meeting - Tomorrow at 10 AM\n\n" +
      "Hi Team,\n\n" +
      "This is a reminder that we have our weekly project sync tomorrow at 10 AM in Conference Room B. " +
      "Please come prepared with your updates on the Q3 deliverables.\n\n" +
      "Agenda:\n" +
      "- Project status updates\n" +
      "- Budget review\n" +
      "- Upcoming deadlines\n\n" +
      "Let me know if you have any items to add to the agenda.\n\n" +
      "Thanks,\n" +
      "Sarah"
    );
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
          height: 'calc(85vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          background: 'linear-gradient(145deg, #1e1e2f, #2d2d44)',
          border: '1px solid #4a4a6a',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Header with Back to Home button */}
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
                boxShadow: '0 4px 10px rgba(255,107,107,0.5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f03e3e, #c92a2a)',
                }
              }}
            >
              Back to Home
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UploadFileIcon sx={{ fontSize: 28, color: '#ffd700' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                Spam Filter
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

        {/* Scrollable Content Area */}
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
          
          {/* Sample Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={loadSpamSample}
              sx={{
                borderColor: '#f5576c',
                color: '#f5576c',
                '&:hover': {
                  borderColor: '#f093fb',
                  color: '#f093fb',
                  background: 'rgba(245,87,108,0.1)',
                }
              }}
            >
              Load Spam Sample
            </Button>
            <Button
              variant="outlined"
              onClick={loadHamSample}
              sx={{
                borderColor: '#96c93d',
                color: '#96c93d',
                '&:hover': {
                  borderColor: '#00b09b',
                  color: '#00b09b',
                  background: 'rgba(150,201,61,0.1)',
                }
              }}
            >
              Load Legitimate Sample
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Upload Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #6a1b9a, #4a148c)',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(106,27,154,0.5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #4a148c, #6a1b9a)',
                      },
                    }}
                  >
                    Upload File
                    <input
                      type="file"
                      hidden
                      accept=".txt,.eml,.msg"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  {file && (
                    <Chip 
                      label={file.name} 
                      onDelete={() => {
                        setFile(null);
                        setEmailContent('');
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #2d2d44, #1e1e2f)',
                        color: '#e0e0e0',
                        border: '1px solid #4a4a6a',
                        '& .MuiChip-deleteIcon': {
                          color: '#f5576c',
                          '&:hover': {
                            color: '#f093fb',
                          }
                        }
                      }}
                    />
                  )}
                </Box>

                {/* Email Content TextArea */}
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  placeholder="Paste email content here..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  disabled={loading}
                  error={!!error}
                  helperText={error}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#1e1e2f',
                      color: '#e0e0e0',
                      '& fieldset': {
                        borderColor: '#4a4a6a',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9575cd',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6a1b9a',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#8080a0',
                      opacity: 1,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f5576c',
                      background: 'rgba(245,87,108,0.1)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginTop: '4px',
                    },
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={checkSpam}
                  disabled={loading || !emailContent.trim()}
                  sx={{ 
                    minWidth: 150,
                    background: 'linear-gradient(45deg, #6a1b9a, #4a148c)',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(106,27,154,0.5)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4a148c, #6a1b9a)',
                    },
                    '&.Mui-disabled': {
                      background: '#3d3d5a',
                      color: '#8080a0',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Check for Spam'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={clearAll} 
                  disabled={loading}
                  sx={{
                    borderColor: '#9575cd',
                    color: '#9575cd',
                    '&:hover': {
                      borderColor: '#6a1b9a',
                      color: '#6a1b9a',
                      background: 'rgba(106,27,154,0.1)',
                    }
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>

            {/* Results Card */}
            <Grid item xs={12} md={4}>
              {result && !result.error && (
                <Card sx={{ 
                  background: result.isSpam 
                    ? 'linear-gradient(135deg, #c62828, #b71c1c)'
                    : 'linear-gradient(135deg, #00b09b, #96c93d)',
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: result.isSpam 
                    ? '0 10px 20px rgba(198,40,40,0.5)'
                    : '0 10px 20px rgba(0,176,155,0.5)',
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                      Analysis Result
                    </Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Typography variant="h3" sx={{ fontSize: '4rem' }}>
                        {result.isSpam ? '⚠️' : '✅'}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mt: 1 }}>
                        {result.isSpam ? 'SPAM DETECTED' : 'LEGITIMATE EMAIL'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
                        Confidence Level:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={result.confidence * 100}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: 'rgba(255,255,255,0.3)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: 'white',
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {(result.confidence * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
                        Spam Score:
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {(result.spamScore * 100).toFixed(1)}%
                      </Typography>
                    </Box>

                    {result.keywordMatches && result.keywordMatches.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
                          Detected Keywords:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {result.keywordMatches.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              sx={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          {/* History Section */}
          {history.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#ffd700',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
              }}>
                <HistoryIcon /> Check History
              </Typography>
              <TableContainer component={Paper} sx={{ 
                background: 'linear-gradient(135deg, #2d2d44, #1e1e2f)',
                border: '1px solid #4a4a6a',
                borderRadius: 2,
                overflow: 'auto',
                maxHeight: '400px',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
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
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      background: 'linear-gradient(90deg, #6a1b9a, #4a148c)',
                    }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: '#4a148c' }}>Time</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: '#4a148c' }}>Email Preview</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: '#4a148c' }}>Result</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: '#4a148c' }}>Confidence</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: '#4a148c' }}>Spam Score</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', backgroundColor: '#4a148c' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow 
                        key={item.id}
                        sx={{
                          '&:hover': {
                            background: 'rgba(106,27,154,0.1)',
                          }
                        }}
                      >
                        <TableCell sx={{ color: '#e0e0e0' }}>{item.timestamp}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0' }}>{item.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.result}
                            sx={{
                              background: item.result === 'Spam' 
                                ? 'linear-gradient(45deg, #f093fb, #f5576c)'
                                : 'linear-gradient(45deg, #00b09b, #96c93d)',
                              color: 'white',
                              fontWeight: 'bold',
                              minWidth: '60px'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.confidence * 100}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#2d2d44',
                                '& .MuiLinearProgress-bar': {
                                  background: item.confidence > 0.7 
                                    ? 'linear-gradient(90deg, #00b09b, #96c93d)'
                                    : 'linear-gradient(90deg, #f093fb, #f5576c)',
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                              {(item.confidence * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: item.spamScore > 0.5 ? '#f5576c' : '#96c93d',
                              fontWeight: 'bold'
                            }}
                          >
                            {(item.spamScore * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromHistory(item.id)}
                            sx={{ 
                              color: '#f5576c',
                              '&:hover': {
                                color: '#f093fb',
                                background: 'rgba(245,87,108,0.1)',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SpamFilter;