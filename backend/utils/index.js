const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test endpoint - THIS SHOULD WORK
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working on Vercel!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const responses = {
      'hello': 'Hi there! How can I help you today?',
      'hi': 'Hello! Nice to meet you!',
      'how are you': 'I\'m doing great! How about you?',
      'help': 'I can help you with various tasks. Just ask me anything!',
      'bye': 'Goodbye! Have a great day!',
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

    res.json({ 
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Export for Vercel
module.exports = app;