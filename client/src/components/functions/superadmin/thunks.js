import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchLocales = createAsyncThunk(
    "superadmin/fetchLocales",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/superadmin/locales`, getAuthHeader());
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || "Error al cargar locales");
        }
    }
);

export const createLocal = createAsyncThunk(
    "superadmin/createLocal",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/superadmin/locales`, formData, {
                headers: { 
                    ...getAuthHeader().headers,
                    "Content-Type": "multipart/form-data" 
                }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || "Error al crear local");
        }
    }
);

export const updateLocal = createAsyncThunk(
    "superadmin/updateLocal",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/superadmin/locales/${id}`, formData, {
                headers: { 
                    ...getAuthHeader().headers,
                    "Content-Type": "multipart/form-data" 
                }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || "Error al actualizar local");
        }
    }
);

export const fetchAdmins = createAsyncThunk(
    "superadmin/fetchAdmins",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/superadmin/admins`, getAuthHeader());
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || "Error al cargar administradores");
        }
    }
);

export const createAdmin = createAsyncThunk(
    "superadmin/createAdmin",
    async (adminData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/superadmin/admins`, adminData, getAuthHeader());
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || "Error al crear administrador");
        }
    }
);

export const updateAdmin = createAsyncThunk(
    "superadmin/updateAdmin",
    async ({ id, adminData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/superadmin/admins/${id}`, adminData, getAuthHeader());
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || "Error al actualizar administrador");
        }
    }
);




