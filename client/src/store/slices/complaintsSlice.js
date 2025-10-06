import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchComplaints = createAsyncThunk('complaints/fetch', async (_, thunkAPI)=>{
  const state = thunkAPI.getState();
  const res = await fetch('http://localhost:4000/api/complaints', { headers: { Authorization: 'Bearer '+state.auth.token } });
  return res.json();
});

const slice = createSlice({
  name:'complaints',
  initialState: { list: [], status: 'idle' },
  reducers:{},
  extraReducers: builder => {
    builder.addCase(fetchComplaints.fulfilled, (state, action)=>{ state.list = action.payload; state.status = 'succeeded'; });
  }
});

export default slice.reducer;
