import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setOrderInfo, setError, setLoading, setStatus } from "./staffSlice";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchOrderByQR = createAsyncThunk(
    "staff/fetchOrderByQR",
    async (qrCode, { dispatch }) => {
        dispatch(setLoading(true));
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/orders/by-qr/${qrCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch(setOrderInfo(response.data));
            return response.data;
        } catch (err) {
            const message = err.response?.data?.error || "Error fetching order";
            dispatch(setError(message));
            throw err;
        }
    }
);

export const validateOrder = createAsyncThunk(
    "staff/validateOrder",
    async (orderId, { dispatch }) => {
        dispatch(setLoading(true));
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_URL}/orders/${orderId}/validate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch(setStatus("success"));
        } catch (err) {
            const message = err.response?.data?.error || "Error validating order";
            dispatch(setError(message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }
);




