require('dotenv').config()
const express = require('express')
const cors = require('cors')

console.log('[Server] 🚀 Initialising Talon API...');

const app = express()
const port = process.env.PORT || 5000

// 1. Detailed Request Logger (VERY HELPFUL FOR VERCEL)
app.use((req, res, next) => {
  console.log(`[Request] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  // Log presence of auth header without exposing token
  if (req.headers.authorization) {
    console.log(`[Request] Auth Header detected: Bearer ${req.headers.authorization.substring(7, 15)}...`);
  }
  next();
});

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// 2. Disable Caching for API
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// CORS preflight is already handled by the app.use(cors(...)) middleware above.
// app.options('*', cors())


// Root / Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Talon API is running.',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

const authRoutes = require('./routes/authRoutes')
const charityRoutes = require('./routes/charityRoutes')
const subscriptionRoutes = require('./routes/subscriptionRoutes')
const subscriptionController = require('./controllers/subscriptionController')
const scoreRoutes = require('./routes/scoreRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/charities', charityRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.post('/api/webhook/paddle', subscriptionController.handleWebhook)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start the server only if run directly (local dev)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

module.exports = app;
