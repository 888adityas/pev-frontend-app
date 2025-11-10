import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios, { endpoints } from 'src/utils/axios';

// Initial State
const initialState = {
  email_lists: {
    data: [],
    totalPages: 1, // pages
    totalCount: 0, // total_count
    currentPage: 1, // page
    perPage: 10, // limit
    getStatus: 'idle',
    getError: null,
    currentRow: null,
  },
  downloadReport: {
    error: null,
    status: 'idle',
  },
  fileUpload: {
    error: null,
    status: 'idle',
  },
  bulkVerification: {
    error: null,
    status: 'idle',
    data: null,
  },
  deleteEmailList: {
    error: null,
    status: 'idle',
  },
};

// Async thunk to fetch email lists
export const fetchEmailLists = createAsyncThunk(
  'emailList/fetchEmailLists',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.emailList.list, { params });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Asyn thunk to fetch email list status
export const fetchEmailListStatus = createAsyncThunk(
  'emailList/fetchEmailListStatus',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.verifyEmail.getEmailListStatus, { params });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Async thunk to start verification process
export const startBulkVerification = createAsyncThunk(
  'emailList/startVerification',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch(endpoints.verifyEmail.verifyEmailList, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Async thunk to upload csv
export const uploadCsv = createAsyncThunk(
  'emailList/uploadCsv',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(endpoints.verifyEmail.uploadEmailList, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Async thunk to download report for email list
export const downloadReport = createAsyncThunk(
  'emailList/downloadReport',
  async (data, { rejectWithValue }) => {
    try {
      console.log('Thunk received data:', data);

      // destructure the payload
      const { jobId, filter } = data;

      // ✅ Send to your backend (assuming your backend expects JSON body)
      const response = await axios.post(
        endpoints.verifyEmail.downloadEmailListResult,
        {
          jobId, // include the jobId from frontend
          filter, // the selectedOption: 'all', 'deliverable', or 'undeliverable'
        },
        {
          responseType: 'blob', // important for downloading CSV/Binary file
        }
      );

      // ✅ Convert blob into downloadable file (trigger browser download)
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `report_${filter}.csv`;
      link.click();

      return true;
    } catch (error) {
      console.error('Download report error:', error);
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// Async thunk to delete email list with job id
export const deleteEmailList = createAsyncThunk(
  'emailList/deleteEmailList',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.delete(endpoints.verifyEmail.deleteEmailList, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? error.message);
    }
  }
);

// handle rejected
const handleRejected = (state, action) => {
  switch (action.type) {
    case 'emailList/fetchEmailLists/rejected':
      state.email_lists.getStatus = 'rejected';
      state.email_lists.getError = action.payload || action.error.message;
      break;
    case 'emailList/downloadReport/rejected':
      state.downloadReport.error = action.payload || action.error.message;
      state.downloadReport.status = 'failed';
      break;
    case 'emailList/uploadCsv/rejected':
      state.fileUpload.error = action.payload || action.error.message;
      state.fileUpload.status = 'failed';
      break;
    case 'emailList/startVerification/rejected':
      state.bulkVerification.error = action.payload || action.error.message;
      state.bulkVerification.status = 'failed';
      break;
    default:
      break;
  }
};

// handle pending
const handlePending = (state, action) => {
  switch (action.type) {
    case 'emailList/fetchEmailLists/pending':
      state.email_lists.getStatus = 'loading...';
      break;
    case 'emailList/downloadReport/pending':
      state.downloadReport.status = 'downloading';
      break;
    case 'emailList/uploadCsv/pending':
      state.fileUpload.status = 'uploading';
      break;
    case 'emailList/startVerification/pending':
      state.bulkVerification.status = 'verifying';
      break;
    default:
      break;
  }
};

// handle fulfilled
const handleFulfilled = (state, action) => {
  switch (action.type) {
    case 'emailList/fetchEmailLists/fulfilled':
      state.email_lists.data = action.payload.data.items;
      state.email_lists.getStatus = 'success';
      state.email_lists.totalPages = action.payload.data.pagination.pages || 1;
      state.email_lists.totalCount = action.payload.data.pagination.total_count || 1;
      state.email_lists.currentPage = action.payload.data.pagination.page || 1;
      state.email_lists.perPage = action.payload.data.pagination.limit || 1;
      break;
    case 'emailList/downloadReport/fulfilled':
      state.downloadReport.status = 'success';
      state.downloadReport.error = null;
      break;
    case 'emailList/uploadCsv/fulfilled':
      state.fileUpload.status = 'success';
      state.fileUpload.error = null;
      break;
    case 'emailList/startVerification/fulfilled':
      state.bulkVerification.status = 'success';
      state.bulkVerification.error = null;
      state.bulkVerification.data = action.payload.data;
      break;
    case 'emailList/fetchEmailListStatus/fulfilled':
      state.email_lists.currentRow = action.payload.data.emailList;
      break;
    default:
      break;
  }
};

// create user slice
const emailListSlice = createSlice({
  name: 'email_list',
  initialState,
  reducers: {
    clear: (state) => {
      state.email_lists.data = [];
      state.email_lists.totalPages = 1;
      state.email_lists.totalCount = 0;
      state.email_lists.currentPage = 1;
      state.email_lists.perPage = 10;
      state.email_lists.getStatus = 'idle';
      state.email_lists.getError = null;
    },
    clearDownloadReport: (state) => {
      state.downloadReport.error = null;
      state.downloadReport.status = 'idle';
    },
    clearFileUpload: (state) => {
      state.fileUpload.error = null;
      state.fileUpload.status = 'idle';
    },
    clearBulkVerification: (state) => {
      state.bulkVerification.error = null;
      state.bulkVerification.status = 'idle';
      state.bulkVerification.data = null;
    },
  },

  extraReducers: (builders) => {
    builders
      // Get Email Lists Case Handle
      .addCase(fetchEmailLists.pending, handlePending)
      .addCase(fetchEmailLists.rejected, handleRejected)
      .addCase(fetchEmailLists.fulfilled, handleFulfilled)

      // Downlaod report case handle
      .addCase(downloadReport.pending, handlePending)
      .addCase(downloadReport.rejected, handleRejected)
      .addCase(downloadReport.fulfilled, handleFulfilled)

      // Upload csv case handle
      .addCase(uploadCsv.pending, handlePending)
      .addCase(uploadCsv.rejected, handleRejected)
      .addCase(uploadCsv.fulfilled, handleFulfilled)

      // Start verification case handle
      .addCase(startBulkVerification.pending, handlePending)
      .addCase(startBulkVerification.rejected, handleRejected)
      .addCase(startBulkVerification.fulfilled, handleFulfilled);
  },
});

export const { clear, clearDownloadReport, clearFileUpload, clearBulkVerification } =
  emailListSlice.actions;
export default emailListSlice.reducer;
