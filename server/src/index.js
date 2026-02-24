require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Rate limiting on feedback submission
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: { error: 'Too many submissions. Please try again later.' }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/feedback', feedbackLimiter, require('./routes/feedback'));
app.use('/api/admin', require('./routes/admin'));

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.listen(PORT, () => console.log(`SDET Feedback Server running on port ${PORT}`));
