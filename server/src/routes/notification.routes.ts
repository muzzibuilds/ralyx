import express, { Router } from 'express';
import { emailNotificationsEnabled, sendWaitlistConfirmationEmail } from '../email';

export const notificationRouter = Router();

notificationRouter.post('/waitlist-confirmation', express.json(), async (req, res) => {
  try {
    const { firstName, email, seasonName } = req.body;

    if (!firstName || !email) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'firstName and email are required',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    await sendWaitlistConfirmationEmail({
      firstName,
      email,
      seasonName,
    });

    res.json({
      success: true,
      emailEnabled: emailNotificationsEnabled(),
    });
  } catch (error) {
    console.error('Error sending waitlist confirmation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send waitlist confirmation',
    });
  }
});

export default notificationRouter;