import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import { dbStore } from '../services/dbStore.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  let { month } = req.query;

  if (!month) {
    const today = new Date();
    month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  const budgets = await dbStore.getBudgets(req.user.id, month);
  res.json({
    success: true,
    data: budgets
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { category, limit, month } = req.body;

  if (!category || limit === undefined) {
    res.status(400);
    throw new Error('Please include category and limit');
  }

  if (isNaN(Number(limit)) || Number(limit) < 0) {
    res.status(400);
    throw new Error('Limit must be a non-negative number');
  }

  let targetMonth = month;
  if (!targetMonth) {
    const today = new Date();
    targetMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  const budget = await dbStore.createOrUpdateBudget({
    userId: req.user.id,
    category,
    limit: Number(limit),
    month: targetMonth
  });

  res.status(200).json({
    success: true,
    data: budget
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await dbStore.deleteBudget(req.params.id, req.user.id);

  if (!deleted) {
    res.status(404);
    throw new Error('Budget not found or unauthorized');
  }

  res.json({
    success: true,
    data: deleted
  });
}));

export default router;
