import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'spendoray_super_secret_jwt_key_2026';

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('Please add all fields'); }

  const userExists = await dbStore.findUserByEmail(email);
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await dbStore.createUser({ name, email, password: hashedPassword });

  if (user) {
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }

  const user = await dbStore.findUserByEmail(email);
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email } } });
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
}));

router.put('/update-name', authenticateToken, asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  if (!name) { res.status(400); throw new Error('Name is required'); }

  const updatedUser = await dbStore.updateUserName(userId, name);
  if (updatedUser) {
    const token = jwt.sign({ id: updatedUser._id, email: updatedUser.email, name: updatedUser.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, data: { token, user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email } } });
  } else {
    res.status(404); throw new Error('User not found');
  }
}));

router.put('/update-password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  if (!currentPassword || !newPassword) { res.status(400); throw new Error('Both passwords are required'); }
  if (newPassword.length < 6) { res.status(400); throw new Error('New password must be at least 6 characters'); }

  const user = await dbStore.findUserByIdWithPassword(userId);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) { res.status(401); throw new Error('Current password is incorrect'); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  const updatedUser = await dbStore.updateUserPassword(userId, hashedPassword);

  if (updatedUser) {
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    res.status(404); throw new Error('User not found');
  }
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await dbStore.findUserByEmail(email);
  if (!user) return res.json({ success: true, message: 'If that email exists, a code was sent' });

  const code = crypto.randomInt(100000, 999999).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await dbStore.setResetCode(email, code, expiry.toISOString());

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Spendoray" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Your Spendoray Password Reset Code',
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:36px;border-radius:16px;background:#f5f3ff;">
        <h2 style="color:#4f46e5;margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#6b7280;font-size:14px;">Use the code below to reset your Spendoray password. It expires in <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;padding:24px;background:white;border-radius:12px;">
          <span style="font-size:40px;font-weight:900;letter-spacing:14px;color:#4f46e5;">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  res.json({ success: true, message: 'If that email exists, a code was sent' });
}));

router.post('/verify-reset-code', asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) { res.status(400); throw new Error('Email and code are required'); }

  const user = await dbStore.findUserByEmail(email);
  if (!user || !user.resetCode || !user.resetCodeExpiry) {
    res.status(400); throw new Error('Invalid or expired code');
  }
  if (user.resetCode !== code) {
    res.status(400); throw new Error('Incorrect code');
  }
  if (new Date() > new Date(user.resetCodeExpiry)) {
    res.status(400); throw new Error('Code has expired. Please request a new one.');
  }

  res.json({ success: true, message: 'Code verified' });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) { res.status(400); throw new Error('All fields are required'); }
  if (newPassword.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }

  const user = await dbStore.findUserByEmail(email);
  if (!user || !user.resetCode || !user.resetCodeExpiry) {
    res.status(400); throw new Error('Invalid or expired code');
  }
  if (user.resetCode !== code) {
    res.status(400); throw new Error('Incorrect code');
  }
  if (new Date() > new Date(user.resetCodeExpiry)) {
    res.status(400); throw new Error('Code has expired. Please request a new one.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await dbStore.resetPasswordByEmail(email, hashedPassword);

  res.json({ success: true, message: 'Password reset successfully' });
}));

export default router;