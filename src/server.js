// src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, requestLogger } from './middleware/errorHandler.js';

// Import all routes
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finance.js';
import journalRoutes from './routes/journal.js';
import habitRoutes from './routes/habits.js';
import subscriptionRoutes from './routes/subscriptions.js';
import wellnessRoutes from './routes/wellness.js';
import gratitudeRoutes from './routes/gratitude.js';
import hydrationRoutes from './routes/hydration.js';
import sleepRoutes from './routes/sleep.js';
import settingsRoutes from './routes/settings.js';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Trust proxy (for deployment behind reverse proxies like Heroku, Render, etc.)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers

app.use(compression()); // Compress responses

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to NEMESIS API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      finance: '/api/finance/*',
      journal: '/api/journal/*',
      habits: '/api/habits/*',
      subscriptions: '/api/subscriptions/*',
      wellness: '/api/wellness/*',
      gratitude: '/api/gratitude/*',
      hydration: '/api/hydration/*',
      sleep: '/api/sleep/*',
      settings: '/api/settings/*',
      ai: '/api/ai/*'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NEMESIS Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/gratitude', gratitudeRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/finance',
      'POST /api/finance',
      'GET /api/journal',
      'POST /api/journal',
      'GET /api/habits',
      'POST /api/habits',
      'POST /api/habits/:id/toggle',
      'GET /api/subscriptions',
      'GET /api/wellness/config',
      'GET /api/gratitude',
      'GET /api/hydration/today',
      'GET /api/sleep/latest',
      'GET /api/settings',
      'POST /api/ai/insights'
    ]
  });
});

// Error Handler - Must be last
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        NEMESIS Backend Server Running                ║
║                                                       ║
║        Port: ${PORT.toString().padEnd(43)}║
║        Environment: ${(process.env.NODE_ENV || 'development').padEnd(37)}║
║        API: http://localhost:${PORT}/api${' '.repeat(20)}║
║                                                       ║
║        Status: ✓ ONLINE                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  console.log('\n📡 Available Endpoints:');
  console.log('   • Health Check: GET /api/health');
  console.log('   • Authentication: POST /api/auth/register, /api/auth/login');
  console.log('   • Finance: GET/POST /api/finance');
  console.log('   • Journal: GET/POST /api/journal');
  console.log('   • Habits: GET/POST /api/habits');
  console.log('   • Subscriptions: GET/POST /api/subscriptions');
  console.log('   • Wellness: GET/PUT /api/wellness/config');
  console.log('   • Gratitude: GET/PUT /api/gratitude');
  console.log('   • Hydration: GET/PUT /api/hydration/today');
  console.log('   • Sleep: GET/POST /api/sleep');
  console.log('   • Settings: GET/PUT /api/settings');
  console.log('   • AI Insights: POST /api/ai/insights\n');
});

export default app;