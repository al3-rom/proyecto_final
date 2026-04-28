import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUser, setError } from "../auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchUserProfile = createAsyncThunk(
    "functions/fetchUserProfile",
    async (_, { getState, dispatch }) => {
        try {
            const token = getState().auth.token;
            if (!token) throw new Error("No hay token disponible");

            const response = await axios.get(`${API_URL}/usuario/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const usuarioBackend = response.data.usuario;

            dispatch(setUser(usuarioBackend));
            
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            if (storage.getItem('user')) {
                storage.setItem('user', JSON.stringify(usuarioBackend));
            }

            return usuarioBackend;
        } catch (error) {
            throw error;
        }
    }
);

export const updateProfilePhoto = createAsyncThunk(
    "functions/updateProfilePhoto",
    async (formData, { getState, dispatch }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.put(`${API_URL}/usuario/update-profile`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const usuarioBackend = response.data.usuario;
            dispatch(setUser(usuarioBackend));
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            if (storage.getItem('user')) {
                storage.setItem('user', JSON.stringify(usuarioBackend));
            }
            return usuarioBackend;
        } catch (error) {
            dispatch(setError(error.response?.data?.error || "Error at upload image"));
            throw error;
        }
    }
);

export const changePasswordThunk = createAsyncThunk(
    "functions/changePassword",
    async ({ currentPassword, newPassword }, { getState, dispatch }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.put(`${API_URL}/usuario/change-password`, { currentPassword, newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            dispatch(setError(error.response?.data?.error === 'invalid_password' ? 'invalid_password' : "Error at change password"));
            throw error;
        }
    }
);

export const deleteProfileThunk = createAsyncThunk(
    "functions/deleteProfile",
    async (password, { getState, dispatch }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.delete(`${API_URL}/usuario/delete-profile`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { password }
            });
            return response.data;
        } catch (error) {
            dispatch(setError(error.response?.data?.error === 'invalid_password' ? 'invalid_password' : "Error at delete profile"));
            throw error;
        }
    }
);

export const recargarSaldoThunk = createAsyncThunk(
    "functions/recargarSaldo",
    async (cantidad, { getState, dispatch }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`${API_URL}/saldo/recargar`, { cantidad: Number(cantidad) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const currentUser = getState().auth.user;
            const updatedUser = { ...currentUser, saldo: response.data.saldo };
            dispatch(setUser(updatedUser));
            
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            if (storage.getItem('user')) {
                storage.setItem('user', JSON.stringify(updatedUser));
            }
            return response.data;
        } catch (error) {
            dispatch(setError(error.response?.data?.error || "Error at recharge"));
            throw error;
        }
    }
);




