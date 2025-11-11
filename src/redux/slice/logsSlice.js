import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios, { endpoints } from 'src/utils/axios';

// Initial State
const initialState = {
  emailVerificationLogs: {
    data: [],
    totalPages: 1, // pages
    totalCount: 0, // total_count
    currentPage: 1, // page
    perPage: 5, // limit
  },
  activityLogs: {
    data: [],
    totalPages: 1, // pages
    totalCount: 0, // total_count
    currentPage: 1, // page
    perPage: 5, // limit
  },
  status: 'idle',
  error: null,
};

// Async thunk to fetch activity logs
export const fetchActivityLogs = createAsyncThunk(
  'logs/activityLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.logs.activityLogs, { params });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Async thunk to fetch verification logs
export const fetchEmailVerificationLogs = createAsyncThunk(
  'logs/emailVerificationLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.logs.verificationLogs, { params });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// handle rejected
const handleRejected = (state, action) => {
  switch (action.type) {
    case 'logs/activityLogs/rejected':
      state.status = 'rejected';
      state.error = action.payload || action.error.message;
      break;
    case 'logs/emailVerificationLogs/rejected':
      state.status = 'rejected';
      state.error = action.payload || action.error.message;
      break;
    default:
      break;
  }
};

// handle pending
const handlePending = (state, action) => {
  switch (action.type) {
    case 'logs/activityLogs/pending':
      state.status = 'loading';
      break;
    case 'logs/emailVerificationLogs/pending':
      state.status = 'loading';
      break;
    default:
      break;
  }
};

// handle fulfilled
const handleFulfilled = (state, action) => {
  switch (action.type) {
    case 'logs/activityLogs/fulfilled':
      state.status = 'success';
      state.error = null;
      state.activityLogs.data = action.payload.data.items || [];
      state.activityLogs.totalPages = action.payload.data.pagination.pages || 1;
      state.activityLogs.totalCount = action.payload.data.pagination.total_count || 1;
      state.activityLogs.currentPage = action.payload.data.pagination.page || 1;
      state.activityLogs.perPage = action.payload.data.pagination.limit || 5;
      break;

    case 'logs/emailVerificationLogs/fulfilled':
      state.status = 'success';
      state.error = null;
      state.emailVerificationLogs.data = action.payload.data.items || [];
      state.emailVerificationLogs.totalPages = action.payload.data.pagination.pages || 1;
      state.emailVerificationLogs.totalCount = action.payload.data.pagination.total_count || 1;
      state.emailVerificationLogs.currentPage = action.payload.data.pagination.page || 1;
      state.emailVerificationLogs.perPage = action.payload.data.pagination.limit || 5;
      break;
    default:
      break;
  }
};

// create user slice
const logsSlice = createSlice({
  name: 'get_logs',
  initialState,
  reducers: {
    clearActivityLogs: (state) => {
      state.activityLogs.data = [];
      state.activityLogs.totalPages = 1; // pages
      state.activityLogs.totalCount = 0; // total_count
      state.activityLogs.currentPage = 1; // page
      state.activityLogs.perPage = 5; // limit
    },
    clearEmailVerificationLogs: (state) => {
      state.emailVerificationLogs.data = [];
      state.emailVerificationLogs.totalPages = 1; // pages
      state.emailVerificationLogs.totalCount = 0; // total_count
      state.emailVerificationLogs.currentPage = 1; // page
      state.emailVerificationLogs.perPage = 5; // limit
    },
  },

  extraReducers: (builders) => {
    builders
      // fetch activity logs case handle
      .addCase(fetchActivityLogs.pending, handlePending)
      .addCase(fetchActivityLogs.rejected, handleRejected)
      .addCase(fetchActivityLogs.fulfilled, handleFulfilled)

      // fetch verification logs case handle
      .addCase(fetchEmailVerificationLogs.pending, handlePending)
      .addCase(fetchEmailVerificationLogs.rejected, handleRejected)
      .addCase(fetchEmailVerificationLogs.fulfilled, handleFulfilled);
  },
});

export const { clearActivityLogs, clearEmailVerificationLogs } = logsSlice.actions;
export default logsSlice.reducer;
