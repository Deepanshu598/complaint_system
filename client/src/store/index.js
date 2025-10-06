import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import complaintsReducer from './slices/complaintsSlice';

export default configureStore({
  reducer: { auth: authReducer, users: usersReducer, complaints: complaintsReducer }
});
