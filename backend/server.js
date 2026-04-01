const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
// Update CORS for production
app.use(cors({
  origin: process.env.VERCEL ? 'https://ai-application-ten.vercel.app' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== TEST ENDPOINT ====================
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working on Vercel!' });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.VERCEL ? 'Vercel' : 'Local'
  });
});

// Ensure uploads directory exists (Vercel has read-only filesystem, so this won't work)
// For Vercel, we'll handle this differently
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir) && !process.env.VERCEL) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For Vercel, use /tmp directory
    const dest = process.env.VERCEL ? '/tmp/uploads' : uploadsDir;
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==================== CHATBOT ENDPOINT ====================
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Processing chat message: "${message.substring(0, 50)}..."`);

    const responses = {
      'hello': 'Hi there! How can I help you today?',
      'hi': 'Hello! Nice to meet you!',
      'how are you': 'I\'m doing great, thanks for asking! How about you?',
      'what is your name': 'I\'m your AI assistant! You can call me ChatBot.',
      'who created you': 'I was created by the AI Applications Platform team!',
      'help': 'I can help you with various tasks. Just ask me anything!',
      'bye': 'Goodbye! Have a great day!',
      'thanks': 'You\'re welcome! Happy to help!',
      'default': 'That\'s interesting! Tell me more about that.'
    };

    const lowerMessage = message.toLowerCase().trim();
    let reply = responses.default;

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        reply = value;
        break;
      }
    }

    if (Math.random() > 0.7) {
      reply += ' 😊';
    }

    res.json({ 
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// ==================== SPAM FILTER ENDPOINT ====================
app.post('/api/spam-check', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    const spamKeywords = ['win', 'free', 'prize', 'winner', 'cash', 'money', 'urgent', 'click here', 'limited time', 'offer', 'gift', 'claim', 'congratulations'];
    const emailLower = email.toLowerCase();
    
    let spamScore = 0;
    spamKeywords.forEach(keyword => {
      if (emailLower.includes(keyword)) {
        spamScore += 0.1;
      }
    });

    const words = email.split(' ');
    const allCapsWords = words.filter(word => word.length > 3 && word === word.toUpperCase());
    spamScore += allCapsWords.length * 0.05;

    const exclamations = (email.match(/!/g) || []).length;
    spamScore += exclamations * 0.02;

    spamScore = Math.min(spamScore, 1);
    
    const isSpam = spamScore > 0.3;
    const confidence = isSpam ? 0.5 + spamScore * 0.5 : 1 - spamScore * 0.5;

    res.json({
      isSpam: isSpam,
      confidence: confidence,
      spamScore: spamScore
    });

  } catch (error) {
    console.error('Spam check error:', error);
    res.status(500).json({ error: 'Failed to check spam' });
  }
});

// ==================== SPEECH RECOGNITION ENDPOINT ====================
app.post('/api/speech-to-text', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    console.log(`Processing audio file: ${req.file.path}`);

    const mockTranscriptions = [
      "Hello, how are you today?",
      "This is a test of the speech recognition system.",
      "I'm recording my voice to test this application.",
      "The weather is nice today.",
      "What is the time?",
      "Tell me a joke.",
      "I love using this AI application."
    ];

    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
    const text = mockTranscriptions[randomIndex];
    const confidence = 0.75 + Math.random() * 0.2;

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json({
      success: true,
      text: text,
      confidence: confidence
    });

  } catch (error) {
    console.error('Speech recognition error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process audio' 
    });
  }
});

// ==================== QA SYSTEM ENDPOINT ====================
app.post('/api/qa', (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required' });
    }

    console.log(`Processing QA: "${question.substring(0, 50)}..."`);

    const sentences = context.match(/[^.!?]+[.!?]+/g) || [context];
    const questionWords = question.toLowerCase().split(' ');
    
    let bestSentence = '';
    let bestScore = 0;

    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      let score = 0;
      
      questionWords.forEach(word => {
        if (word.length > 3 && sentenceLower.includes(word)) {
          score++;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    });

    const answer = bestSentence || "I couldn't find a specific answer in the provided context.";
    const confidence = bestScore > 0 ? 0.5 + (bestScore / questionWords.length) * 0.5 : 0.3;

    res.json({
      success: true,
      answer: answer.trim(),
      confidence: Math.min(confidence, 0.95)
    });

  } catch (error) {
    console.error('QA error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process question' 
    });
  }
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel
module.exports = app;