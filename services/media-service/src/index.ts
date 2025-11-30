import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { mediaRoutes } from './routes/media';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase } from './config/database';
import { initializeDatabase } from './migrations/initialize';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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

// Serve static files
const uploadsPath = process.env.UPLOAD_PATH || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'media-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/media', mediaRoutes);

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
      console.log(`Media Service running on port ${PORT}`);
      const serviceUrl = process.env.MEDIA_SERVICE_URL || `http://localhost:${PORT}`;
      console.log(`Health check: ${serviceUrl}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
