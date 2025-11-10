import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios, { endpoints } from 'src/utils/axios';

// Initial State
const initialState = {
  credit_stats: null,
  status: 'idle',
  error: null,
};

// Async thunk to fetch credit stats
//  (_) ->  (data) when you accept data as paramter
export const fetchCreditStats = createAsyncThunk(
  'credits/fetchCreditDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.credit.stats);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// handle rejected
const handleRejected = (state, action) => {
  switch (action.type) {
    case 'credits/fetchCreditDetails/rejected':
      state.status = 'rejected';
      state.error = action.payload || action.error.message;
      break;
    default:
      break;
  }
};

// handle pending
const handlePending = (state) => {
  state.status = 'loading';
  state.error = null;
};

// handle fulfilled
const handleFulfilled = (state, action) => {
  switch (action.type) {
    case 'credits/fetchCreditDetails/fulfilled':
      state.status = 'success';
      state.credit_stats = {
        ...action.payload.data,
      };
      break;
    default:
      break;
  }
};

// create user slice
const creditSlice = createSlice({
  name: 'credit_stats',
  initialState,
  reducers: {
    clear: (state) => {
      state.credit_stats = null;
      state.status = 'idle';
      state.error = null;
    },
  },

  extraReducers: (builders) => {
    builders
      .addCase(fetchCreditStats.pending, handlePending)
      .addCase(fetchCreditStats.rejected, handleRejected)
      .addCase(fetchCreditStats.fulfilled, handleFulfilled);
  },
});

export const { clear } = creditSlice.actions;
export default creditSlice.reducer;
