import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios, {
  endpoints,
  setBasicAuthCredentials,
  clearBasicAuthCredentials,
} from 'src/utils/axios';

// Initial State
const initialState = {
  user: null, // User object or null if not logged in
  status: 'idle', // ["idle", "loading", "succeeded", "failed"]
  error: null, // Error message in case of failure
  credentials: null,
};

// Async thunk to fetch user session
export const fetchUserSession = createAsyncThunk(
  'auth/fetchUserSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.auth.me, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Async thunk to fetch user credentials
export const fetchUserCredentials = createAsyncThunk(
  'auth/fetchUserCredentials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(endpoints.auth.credentials, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);
// Async thunk to update user credentials
export const updateUserSession = createAsyncThunk(
  'auth/updateUserCredentials',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch(endpoints.auth.me, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

const handleRejected = (state, action) => {
  switch (action.type) {
    case 'auth/fetchUserCredentials/rejected':
      state.status = 'rejected';
      state.error = action.payload || action.error.message;
      break;
    case 'auth/updateUserCredentials/rejected':
      state.status = 'rejected';
      state.error = action.payload || action.error.message;
      break;
    default:
      break;
  }
};

const handleFulfilled = (state, action) => {
  switch (action.type) {
    case 'auth/fetchUserCredentials/fulfilled':
      state.status = 'success';
      state.error = null;
      state.credentials = action.payload.data;
      break;
    case 'auth/updateUserCredentials/fulfilled':
      state.status = 'success';
      state.error = null;
      state.credentials = action.payload.data;
      break;

    default:
      break;
  }
};

// create user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      clearBasicAuthCredentials();
    },
  },
  extraReducers: (builders) => {
    builders
      .addCase(fetchUserSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserSession.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = {
          ...action.payload.data,
          displayName: `${action.payload.data.first_name} ${action.payload.data.last_name}`,
        };
        // Set API credentials from user data
        if (action.payload.data.api?.apiKey && action.payload.data.api?.secretKey) {
          setBasicAuthCredentials({
            apiKey: action.payload.data.api.apiKey,
            secretKey: action.payload.data.api.secretKey,
            persist: 'session',
          });
        }
      })
      .addCase(fetchUserSession.rejected)

      // handle user credential case
      .addCase(fetchUserCredentials.rejected, handleRejected)
      .addCase(fetchUserCredentials.fulfilled, handleFulfilled);
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
