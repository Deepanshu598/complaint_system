import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk('users/fetch', async (_, thunkAPI)=>{
  const state = thunkAPI.getState();
  const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:4000';
  const res = await fetch(`${url}/api/users`, { headers: { Authorization: 'Bearer '+state.auth.token } });
  if(!res.ok){
    const text = await res.text();
    try{
      const json = JSON.parse(text);
      console.error('fetchUsers error', json);
    }catch(e){
      console.error('fetchUsers non-json error response', text);
    }
    return [];
  }
  return res.json();
});

const slice = createSlice({
  name:'users',
  initialState: { list: [], status: 'idle' },
  reducers:{},
  extraReducers: builder => {
    builder.addCase(fetchUsers.fulfilled, (state, action)=>{ state.list = action.payload; state.status = 'succeeded'; });
  }
});

export default slice.reducer;
