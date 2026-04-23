import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUser, setToken, setError } from "./authSlice";

const API_URL = import.meta.env.VITE_API_URL;


export const login = createAsyncThunk("auth/login", async ({credentials, rememberMe}, { dispatch }) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.data.token) {
            if (rememberMe) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.usuario));
            } else {
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('user', JSON.stringify(response.data.usuario));
            }
            dispatch(setToken(response.data.token));
            dispatch(setUser(response.data.usuario));
        }
        return response.data;
    } catch (error) {
        dispatch(setError(error.response?.data?.error || "Error en el login"));
        throw error;
    }
});

export const register = createAsyncThunk("auth/register", async (formData, { dispatch }) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data.token) {
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data.usuario));
            dispatch(setToken(response.data.token));
            dispatch(setUser(response.data.usuario));
        }
        return response.data;
    } catch (error) {
    }
});