import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './infrastructure/routes/auth';
import transactionsRouter from './infrastructure/routes/transactions';
import categoriesRouter from './infrastructure/routes/categories';
import budgetsRouter from './infrastructure/routes/budgets';
import accountsRouter from './infrastructure/routes/accounts';
import recurringRouter from './infrastructure/routes/recurring';
import insightsRouter from './infrastructure/routes/insights';
import { errorHandler } from './infrastructure/middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & logging middleware
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// Health check (no auth required)
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'finpulse-api',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (no auth required)
app.use('/api/v1/auth', authRouter);

// Transaction routes (auth required)
app.use('/api/v1/transactions', transactionsRouter);

// Category routes (auth required)
app.use('/api/v1/categories', categoriesRouter);

// Budget routes (auth required)
app.use('/api/v1/budgets', budgetsRouter);

// Account routes (auth required)
app.use('/api/v1/accounts', accountsRouter);

// Recurring transaction routes (auth required)
app.use('/api/v1/recurring', recurringRouter);

// Insights routes (auth required)
app.use('/api/v1/insights', insightsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FinPulse API running on port ${PORT}`);
  });
}

export default app;
