import { createSlice,createAsyncThunk, isRejectedWithValue } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const loginUser = createAsyncThunk(
    'auth/login',
    async({email,password},{rejectWithValue})=>{
        try {
            const response = await api.post('/auth/login',{email,password});
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
)

export const registerUser = createAsyncThunk(
    'auth/register',
    async(userData,{ rejectWithValue }) =>{
        try {
            const response = await api.post('/auth/register',userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration Failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async(_,{rejectWithValue})=>{
        try {
            await api.post('/auth/logout');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout Failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/getme',
    async(_,{rejectWithValue})=>{
        try {
            const response = await api.get('/auth/getme');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch User');
        }
    }
);


const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState = {
    user : storedToken && storedUser ? JSON.parse(storedUser) : null,
    token : storedToken || null,
    isAuthenticated : false,
    authReady : !storedToken,
    loading: false,
    error:null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError:(state)=>{
            state.error = null;
        },
    },
    extraReducers:(builder)=>{
        builder
            .addCase(loginUser.pending,(state)=>{
                state.loading=true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled,(state,action)=>{
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.authReady = true;
                localStorage.setItem('token',action.payload.token);
                localStorage.setItem('user',JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected,(state,action)=>{
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending,(state)=>{
                state.loading = true;
                state.error=null;
            })
            .addCase(registerUser.fulfilled,(state,action)=>{
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.authReady = true;
                localStorage.setItem('token',action.payload.token);
                localStorage.setItem('user',JSON.stringify(action.payload.user));
            })
            .addCase(registerUser.rejected,(state,action)=>{
                state.loading = false;
                state.error =  action.payload;
            })

            .addCase(logoutUser.fulfilled,(state)=>{
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.authReady = true;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            })
            .addCase(fetchCurrentUser.fulfilled,(state,action)=>{
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.authReady = true;
            })
            .addCase(fetchCurrentUser.rejected,(state)=>{
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.authReady = true;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
    },
}
);

export const {clearError} = authSlice.actions;
export default authSlice.reducer;