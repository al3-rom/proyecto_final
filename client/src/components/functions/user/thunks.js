import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateBalance } from "../../auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchLocales = createAsyncThunk("user/fetchLocales", async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get(`${API_URL}/locales`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
});

export const fetchProductosByLocal = createAsyncThunk("user/fetchProductosByLocal", async (localId, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get(`${API_URL}/locales/${localId}/productos`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
});

export const buyProducto = createAsyncThunk("user/buyProducto", async ({ producto_id, local_id }, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.post(`${API_URL}/orders`, { producto_id, local_id }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.nuevoSaldo !== undefined) {
            dispatch(updateBalance(response.data.nuevoSaldo));
        }

        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchMyOrders = createAsyncThunk("user/fetchMyOrders", async (_, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error fetching orders");
    }
});

export const addTip = createAsyncThunk("user/addTip", async ({ orderId, amount }, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.put(`${API_URL}/orders/${orderId}/tip`, { propina: amount }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error adding tip");
    }
});

export const transferOrder = createAsyncThunk("user/transferOrder", async ({ orderId, targetEmail }, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.put(`${API_URL}/orders/${orderId}/transfer`, { targetEmail }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error transferring order");
    }
});

export const fetchPromociones = createAsyncThunk("user/fetchPromociones", async (localId) => {
    const response = await axios.get(`${API_URL}/promociones/local/${localId}`);
    return response.data;
});

export const claimPromocion = createAsyncThunk("user/claimPromocion", async (promoId, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.post(`${API_URL}/promociones/${promoId}/claim`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error claiming promotion");
    }
});

export const sellBackOrders = createAsyncThunk("user/sellBackOrders", async (orderIds, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await axios.post(`${API_URL}/orders/sell-back`, { orderIds }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.nuevoSaldo !== undefined) {
            dispatch(updateBalance(response.data.nuevoSaldo));
        }

        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || "Error selling back orders");
    }
});




