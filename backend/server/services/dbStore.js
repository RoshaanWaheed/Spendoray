import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

let isMockMode = true;
const DATA_FILE_PATH = path.join(process.cwd(), 'server', 'data_store.json');

const serverDir = path.dirname(DATA_FILE_PATH);
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

const initialDb = {
  users: [],
  transactions: [],
  budgets: []
};

function loadMockDb() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading mock data file, using fresh store', err);
  }
  return JSON.parse(JSON.stringify(initialDb));
}

function saveMockDb(db) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing mock database', err);
  }
}

function generateId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri || mongoUri.includes('your_mongodb_connection_string') || mongoUri.trim() === '') {
    console.log('ℹ️ MONGO_URI is configured with placeholder. Running in Offline Persistence Simulator Mode (server/data_store.json).');
    isMockMode = true;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log('✅ MongoDB connected successfully.');
    isMockMode = false;
  } catch (err) {
    console.error('❌ MongoDB connection failed. Falling back to Offline Persistence Simulator.', err.message);
    isMockMode = true;
  }
}

export const dbStore = {
  async findUserByEmail(email) {
    if (!isMockMode) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      const db = loadMockDb();
      return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async findUserById(id) {
    if (!isMockMode) {
      return await User.findById(id).select('-password');
    } else {
      const db = loadMockDb();
      const user = db.users.find(u => u._id === id);
      if (user) {
        const { password, ...safeUser } = user;
        return safeUser;
      }
      return null;
    }
  },

  async findUserByIdWithPassword(id) {
    if (!isMockMode) {
      return await User.findById(id);
    } else {
      const db = loadMockDb();
      return db.users.find(u => u._id === id) || null;
    }
  },

  async createUser({ name, email, password }) {
    if (!isMockMode) {
      return await User.create({ name, email, password });
    } else {
      const db = loadMockDb();
      const newUser = {
        _id: generateId(),
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
        resetCode: null,
        resetCodeExpiry: null,
      };
      db.users.push(newUser);
      saveMockDb(db);
      return newUser;
    }
  },

  async updateUserName(userId, name) {
    if (!isMockMode) {
      return await User.findByIdAndUpdate(userId, { name }, { new: true });
    } else {
      const db = loadMockDb();
      const userIndex = db.users.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        db.users[userIndex].name = name;
        saveMockDb(db);
        return db.users[userIndex];
      }
      return null;
    }
  },

  async updateUserPassword(userId, hashedPassword) {
    if (!isMockMode) {
      return await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    } else {
      const db = loadMockDb();
      const userIndex = db.users.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        db.users[userIndex].password = hashedPassword;
        saveMockDb(db);
        return db.users[userIndex];
      }
      return null;
    }
  },

  async setResetCode(email, code, expiry) {
    if (!isMockMode) {
      return await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { resetCode: code, resetCodeExpiry: expiry },
        { new: true }
      );
    } else {
      const db = loadMockDb();
      const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        db.users[userIndex].resetCode = code;
        db.users[userIndex].resetCodeExpiry = expiry;
        saveMockDb(db);
        return db.users[userIndex];
      }
      return null;
    }
  },

  async clearResetCode(email) {
    if (!isMockMode) {
      return await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { resetCode: null, resetCodeExpiry: null },
        { new: true }
      );
    } else {
      const db = loadMockDb();
      const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        db.users[userIndex].resetCode = null;
        db.users[userIndex].resetCodeExpiry = null;
        saveMockDb(db);
        return db.users[userIndex];
      }
      return null;
    }
  },

  async resetPasswordByEmail(email, hashedPassword) {
    if (!isMockMode) {
      return await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { password: hashedPassword, resetCode: null, resetCodeExpiry: null },
        { new: true }
      );
    } else {
      const db = loadMockDb();
      const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        db.users[userIndex].password = hashedPassword;
        db.users[userIndex].resetCode = null;
        db.users[userIndex].resetCodeExpiry = null;
        saveMockDb(db);
        return db.users[userIndex];
      }
      return null;
    }
  },

  async getTransactions(userId) {
    if (!isMockMode) {
      return await Transaction.find({ userId }).sort({ date: -1 });
    } else {
      const db = loadMockDb();
      return db.transactions
        .filter(t => t.userId === userId.toString())
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async createTransaction({ userId, type, amount, category, note, date }) {
    if (!isMockMode) {
      return await Transaction.create({
        userId, type, amount: Number(amount), category, note,
        date: date ? new Date(date) : new Date(),
      });
    } else {
      const db = loadMockDb();
      const newTx = {
        _id: generateId(),
        userId: userId.toString(),
        type, amount: Number(amount), category,
        note: note || '',
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      db.transactions.push(newTx);
      saveMockDb(db);
      return newTx;
    }
  },

  async deleteTransaction(id, userId) {
    if (!isMockMode) {
      return await Transaction.findOneAndDelete({ _id: id, userId });
    } else {
      const db = loadMockDb();
      const txIndex = db.transactions.findIndex(t => t._id === id && t.userId === userId.toString());
      if (txIndex !== -1) {
        const deleted = db.transactions[txIndex];
        db.transactions.splice(txIndex, 1);
        saveMockDb(db);
        return deleted;
      }
      return null;
    }
  },

  async getBudgets(userId, month) {
    if (!isMockMode) {
      return await Budget.find({ userId, month });
    } else {
      const db = loadMockDb();
      return db.budgets.filter(b => b.userId === userId.toString() && b.month === month);
    }
  },

  async createOrUpdateBudget({ userId, category, limit, month }) {
    if (!isMockMode) {
      let budget = await Budget.findOne({ userId, category, month });
      if (budget) { budget.limit = Number(limit); await budget.save(); return budget; }
      return await Budget.create({ userId, category, limit: Number(limit), month });
    } else {
      const db = loadMockDb();
      let budget = db.budgets.find(
        b => b.userId === userId.toString() && b.category === category && b.month === month
      );
      if (budget) {
        budget.limit = Number(limit);
      } else {
        budget = { _id: generateId(), userId: userId.toString(), category, limit: Number(limit), month };
        db.budgets.push(budget);
      }
      saveMockDb(db);
      return budget;
    }
  },

  async deleteBudget(id, userId) {
    if (!isMockMode) {
      return await Budget.findOneAndDelete({ _id: id, userId });
    } else {
      const db = loadMockDb();
      const bIndex = db.budgets.findIndex(b => b._id === id && b.userId === userId.toString());
      if (bIndex !== -1) {
        const deleted = db.budgets[bIndex];
        db.budgets.splice(bIndex, 1);
        saveMockDb(db);
        return deleted;
      }
      return null;
    }
  }
};