import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const transactions = await dbStore.getTransactions(req.user.id);
  res.json({
    success: true,
    data: transactions
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  if (!type || !amount || !category) {
    res.status(400);
    throw new Error('Please include dynamic type, amount, and category fields');
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400);
    throw new Error('Amount must be a positive number');
  }

  const transaction = await dbStore.createTransaction({
    userId: req.user.id,
    type,
    amount: Number(amount),
    category,
    note: note || '',
    date: date || new Date()
  });

  res.status(201).json({
    success: true,
    data: transaction
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await dbStore.deleteTransaction(req.params.id, req.user.id);

  if (!deleted) {
    res.status(404);
    throw new Error('Transaction not found or unauthorized');
  }

  res.json({
    success: true,
    data: deleted
  });
}));

export default router;
