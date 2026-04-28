import { createSlice } from "@reduxjs/toolkit";
import { fetchStaff, createStaff, updateStaff, deleteStaff, fetchProducts, createProduct, updateProduct, deleteProduct } from "./thunks";

const initialState = {
    staff: [],
    products: [],
    status: "idle",
    productsStatus: "idle",
    error: null,
};

export const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearAdminState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStaff.pending, (state) => { state.status = "loading"; })
            .addCase(fetchStaff.fulfilled, (state, action) => { state.status = "succeeded"; state.staff = action.payload; })
            .addCase(fetchStaff.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
            .addCase(createStaff.fulfilled, (state, action) => {
                if (action.payload.usuario) state.staff.push(action.payload.usuario);
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                const index = state.staff.findIndex((s) => s.id === action.payload.id);
                if (index !== -1) state.staff[index] = action.payload;
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.staff = state.staff.filter((s) => s.id !== action.payload.id);
            })
            .addCase(fetchProducts.pending, (state) => { state.productsStatus = "loading"; })
            .addCase(fetchProducts.fulfilled, (state, action) => { state.productsStatus = "succeeded"; state.products = action.payload; })
            .addCase(fetchProducts.rejected, (state, action) => { state.productsStatus = "failed"; state.error = action.payload; })
            .addCase(createProduct.fulfilled, (state, action) => { state.products.push(action.payload); })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) state.products[index] = action.payload;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter((p) => p.id !== action.payload);
            });
    },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;




