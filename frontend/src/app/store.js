import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import { transactionsApi } from '../features/transactions/transactionsApi.js';
import { budgetsApi } from '../features/budgets/budgetsApi.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [budgetsApi.reducerPath]: budgetsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsApi.middleware,
      budgetsApi.middleware
    ),
});
