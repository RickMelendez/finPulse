import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { NotificationService } from '../../adapters/services/NotificationService';
import { AppError } from '../../shared/errors/AppError';
import db from '../config/database';

const router = Router();
const notificationService = new NotificationService();

// POST /api/v1/notifications/test
router.post('/test', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const dbUser = await db('users').where({ id: user.id }).first(['email', 'phone']);
    if (!dbUser) throw new AppError('User not found', 404);

    await notificationService.sendEmail(
      dbUser.email,
      'FinPulse Test Alert',
      '<h2>Test Alert</h2><p>Your FinPulse notification system is working correctly.</p>',
    );

    let smsSent = false;
    if (dbUser.phone) {
      await notificationService.sendSms(dbUser.phone, 'FinPulse: Your notification system is working!');
      smsSent = true;
    }

    res.json({ success: true, data: { sent: { email: true, sms: smsSent } } });
  } catch (err) {
    next(err);
  }
});

export default router;
