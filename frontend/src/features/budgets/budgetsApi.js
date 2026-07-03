import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const budgetsApi = createApi({
  reducerPath: 'budgetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Budget'],
  endpoints: (builder) => ({
    getBudgets: builder.query({
      query: (month) => `/budgets${month ? `?month=${month}` : ''}`,
      providesTags: ['Budget'],
      transformResponse: (response) => response.data,
    }),
    addBudget: builder.mutation({
      query: (data) => ({
        url: '/budgets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Budget'],
    }),
    deleteBudget: builder.mutation({
      query: (id) => ({
        url: `/budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Budget'],
    }),
  }),
});

export const {
  useGetBudgetsQuery,
  useAddBudgetMutation,
  useDeleteBudgetMutation,
} = budgetsApi;
