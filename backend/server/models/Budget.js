import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Health', 'Shopping', 'Housing', 'Other'],
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
});

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export default Budget;
