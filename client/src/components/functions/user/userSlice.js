import { createSlice } from "@reduxjs/toolkit";
import { fetchLocales, fetchProductosByLocal, buyProducto, fetchMyOrders } from "./thunks";

const userSlice = createSlice({
    name: "user",
    initialState: {
        locales: [],
        localesStatus: "idle",
        selectedLocal: null,
        selectedLocalProducts: [],
        productsStatus: "idle",
        buyStatus: "idle",
        orders: [],
        ordersStatus: "idle",
        error: null,
    },
    reducers: {
        setSelectedLocal: (state, action) => {
            state.selectedLocal = action.payload;
        },
        clearSelectedLocal: (state) => {
            state.selectedLocal = null;
            state.selectedLocalProducts = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocales.pending, (state) => {
                state.localesStatus = "loading";
            })
            .addCase(fetchLocales.fulfilled, (state, action) => {
                state.localesStatus = "succeeded";
                state.locales = action.payload;
            })
            .addCase(fetchLocales.rejected, (state, action) => {
                state.localesStatus = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchProductosByLocal.pending, (state) => {
                state.productsStatus = "loading";
            })
            .addCase(fetchProductosByLocal.fulfilled, (state, action) => {
                state.productsStatus = "succeeded";
                state.selectedLocalProducts = action.payload;
            })
            .addCase(fetchProductosByLocal.rejected, (state, action) => {
                state.productsStatus = "failed";
                state.error = action.error.message;
            })
            .addCase(buyProducto.pending, (state) => {
                state.buyStatus = "loading";
            })
            .addCase(buyProducto.fulfilled, (state) => {
                state.buyStatus = "succeeded";
            })
            .addCase(buyProducto.rejected, (state, action) => {
                state.buyStatus = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchMyOrders.pending, (state) => {
                state.ordersStatus = "loading";
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.ordersStatus = "succeeded";
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.ordersStatus = "failed";
                state.error = action.payload || action.error.message;
            });
    },
});

export const { setSelectedLocal, clearSelectedLocal } = userSlice.actions;
export default userSlice.reducer;




