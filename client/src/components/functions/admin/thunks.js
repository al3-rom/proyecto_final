import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchStaff = createAsyncThunk(
    "admin/fetchStaff",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get(`${API_URL}/staff`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error fetching staff");
        }
    }
);

export const createStaff = createAsyncThunk(
    "admin/createStaff",
    async (staffData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`${API_URL}/staff/register`, staffData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error creating staff");
        }
    }
);

export const updateStaff = createAsyncThunk(
    "admin/updateStaff",
    async ({ id, staffData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.put(`${API_URL}/staff/${id}`, staffData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error updating staff");
        }
    }
);

export const deleteStaff = createAsyncThunk(
    "admin/deleteStaff",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.delete(`${API_URL}/staff/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error deleting staff");
        }
    }
);

export const fetchProducts = createAsyncThunk(
    "admin/fetchProducts",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get(`${API_URL}/productos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error fetching products");
        }
    }
);

export const createProduct = createAsyncThunk(
    "admin/createProduct",
    async (formData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`${API_URL}/productos`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error creating product");
        }
    }
);

export const updateProduct = createAsyncThunk(
    "admin/updateProduct",
    async ({ id, formData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.put(`${API_URL}/productos/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Error updating product");
        }
    }
);

export const deleteProduct = createAsyncThunk("admin/deleteProduct", async (id, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        await axios.delete(`${API_URL}/productos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error deleting product");
    }
});

export const bulkCreateProducts = createAsyncThunk("admin/bulkCreateProducts", async (data, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.post(`${API_URL}/productos/bulk`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchProducts());
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error in bulk import");
    }
});

export const deleteAllProducts = createAsyncThunk("admin/deleteAllProducts", async (localId, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        await axios.delete(`${API_URL}/productos/all?local_id=${localId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchProducts());
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error deleting all products");
    }
});

export const deleteAllStaff = createAsyncThunk("admin/deleteAllStaff", async (localId, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        await axios.delete(`${API_URL}/staff/all/local?local_id=${localId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchStaff());
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error deleting all staff");
    }
});
