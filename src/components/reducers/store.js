import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../reducers/dataSlice';
import userReducer from '../reducers/userSlice';

export default configureStore({
  reducer: {
    data: dataReducer,
    user: userReducer,
  },
});