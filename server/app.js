import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { initDb } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize database
initDb().catch(err => console.error('Database initialization error:', err));

// Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api', apiRoutes);

// Root fallback / ping
app.get('/', (req, res) => {
  res.json({
    name: 'Smart Campus Lost & Found Backend API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'online'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  return res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

export default app;
