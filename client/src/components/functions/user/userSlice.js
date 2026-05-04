import { createSlice } from "@reduxjs/toolkit";
import { fetchLocales, fetchProductosByLocal, buyProducto, fetchMyOrders, addTip, fetchPromociones, transferOrder, claimPromocion, sellBackOrders } from "./thunks";

const userSlice = createSlice({
    name: "user",
    initialState: {
        locales: [],
        localesStatus: "idle",
        selectedLocal: null,
        selectedLocalProducts: [],
        promociones: [],
        productsStatus: "idle",
        buyStatus: "idle",
        orders: [],
        ordersStatus: "idle",
        error: null,
        tipStatus: "idle",
    },
    reducers: {
        setSelectedLocal: (state, action) => {
            state.selectedLocal = action.payload;
        },
        clearSelectedLocal: (state) => {
            state.selectedLocal = null;
            state.selectedLocalProducts = [];
            state.promociones = [];
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
            })
            .addCase(addTip.pending, (state, action) => {
                state.tipStatus = "loading";
                const { orderId, amount } = action.meta.arg;
                const index = state.orders.findIndex(o => o.id === orderId);
                if (index !== -1) {
                    state.orders[index]._prevPropina = state.orders[index].propina;
                    state.orders[index].propina = amount;
                }
            })
            .addCase(addTip.fulfilled, (state, action) => {
                state.tipStatus = "idle";
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index].propina = action.payload.propina;
                    delete state.orders[index]._prevPropina;
                }
            })
            .addCase(addTip.rejected, (state, action) => {
                state.tipStatus = "failed";
                const orderId = action.meta.arg?.orderId;
                const index = state.orders.findIndex(o => o.id === orderId);
                if (index !== -1 && state.orders[index]._prevPropina !== undefined) {
                    state.orders[index].propina = state.orders[index]._prevPropina;
                    delete state.orders[index]._prevPropina;
                }
            })
            .addCase(fetchPromociones.fulfilled, (state, action) => {
                state.promociones = action.payload;
            })
            .addCase(transferOrder.fulfilled, (state, action) => {
                state.orders = state.orders.filter(o => o.id !== action.meta.arg.orderId);
            })
            .addCase(claimPromocion.fulfilled, (state, action) => {
                if (action.payload.pedido) {
                    state.orders.unshift(action.payload.pedido);
                }
            })
            .addCase(sellBackOrders.fulfilled, (state) => {
                state.ordersStatus = "idle";
            });
    },
});

export const { setSelectedLocal, clearSelectedLocal } = userSlice.actions;
export default userSlice.reducer;
