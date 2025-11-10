// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slice/userSlice';
import logsReducer from './slice/logsSlice';
import listNameReducer from './slice/listNameSlice';
import fileUploadReducer from './slice/upload-slice';
import creditStatsReducer from './slice/creditSlice';
import emailListReducer from './slice/emailListSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    creditStats: creditStatsReducer,
    emailList: emailListReducer,
    logs: logsReducer,
    fileUpload: fileUploadReducer,
    listName: listNameReducer,
  },
});

export default store;
