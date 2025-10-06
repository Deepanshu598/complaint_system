import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user')||'null');

const slice = createSlice({
  name: 'auth',
  initialState: { token, user },
  reducers: {
    setAuth(state, action){ state.token = action.payload.token; state.user = action.payload.user; localStorage.setItem('token', action.payload.token); localStorage.setItem('user', JSON.stringify(action.payload.user)); },
    clearAuth(state){ state.token = null; state.user = null; localStorage.clear(); }
  }
});

export const { setAuth, clearAuth } = slice.actions;
export default slice.reducer;
