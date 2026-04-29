import { createSlice } from "@reduxjs/toolkit";
import { 
    fetchStaff, createStaff, updateStaff, deleteStaff, 
    fetchProducts, createProduct, updateProduct, deleteProduct, 
    fetchEcoStats, fetchCatalog,
    fetchPromocionesAdmin, createPromocion, updatePromocion, deletePromocion
} from "./thunks";

const initialState = {
    staff: [],
    products: [],
    catalog: [],
    promociones: [],
    status: "idle",
    productsStatus: "idle",
    catalogStatus: "idle",
    promosStatus: "idle",
    ecoStats: null,
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
            })
            .addCase(fetchEcoStats.fulfilled, (state, action) => {
                state.ecoStats = action.payload;
            })
            .addCase(fetchCatalog.pending, (state) => { state.catalogStatus = "loading"; })
            .addCase(fetchCatalog.fulfilled, (state, action) => { state.catalogStatus = "succeeded"; state.catalog = action.payload; })
            .addCase(fetchCatalog.rejected, (state, action) => { state.catalogStatus = "failed"; })
            .addCase(fetchPromocionesAdmin.pending, (state) => { state.promosStatus = "loading"; })
            .addCase(fetchPromocionesAdmin.fulfilled, (state, action) => { state.promosStatus = "succeeded"; state.promociones = action.payload; })
            .addCase(createPromocion.fulfilled, (state, action) => { state.promociones.push(action.payload); })
            .addCase(updatePromocion.fulfilled, (state, action) => {
                const index = state.promociones.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.promociones[index] = action.payload;
                }
            })
            .addCase(deletePromocion.fulfilled, (state, action) => {
                state.promociones = state.promociones.filter(p => p.id !== action.payload);
            });
    },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
