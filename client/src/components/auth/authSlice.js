import { createSlice } from "@reduxjs/toolkit";

const getSavedUser = () => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch { return null; }
};
const getSavedToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const initialState = {
    user: getSavedUser(),
    token: getSavedToken(),
    isAuthenticated: !!getSavedToken(),
    status: "idle",
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.status = "idle";
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setUser, setToken, logout, setStatus, setError } = authSlice.actions;

export default authSlice.reducer;