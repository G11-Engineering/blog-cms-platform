import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { commentRoutes } from './routes/comments';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase } from './config/database';
import { initializeDatabase } from './migrations/initialize';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'comment-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/comments', commentRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await connectDatabase();
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Comment Service running on port ${PORT}`);
      const serviceUrl = process.env.COMMENT_SERVICE_URL || `http://localhost:${PORT}`;
      console.log(`Health check: ${serviceUrl}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
