import { createSlice } from "@reduxjs/toolkit";
import { 
    fetchLocales, createLocal, updateLocal, deleteLocal,
    fetchAdmins, createAdmin, updateAdmin 
} from "./thunks";

const superAdminSlice = createSlice({
    name: "superadmin",
    initialState: {
        locales: [],
        admins: [],
        loading: false,
        error: null,
        success: null,
    },
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(fetchLocales.pending, (state) => { state.loading = true; })
            .addCase(fetchLocales.fulfilled, (state, action) => {
                state.loading = false;
                state.locales = action.payload;
            })
            .addCase(fetchLocales.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            
            .addCase(createLocal.pending, (state) => { state.loading = true; })
            .addCase(createLocal.fulfilled, (state, action) => {
                state.loading = false;
                state.locales.push(action.payload);
                state.success = "superadmin.successLocalCreated";
            })
            .addCase(createLocal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            
            .addCase(updateLocal.pending, (state) => { state.loading = true; })
            .addCase(updateLocal.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.locales.findIndex(l => l.id === action.payload.id);
                if (index !== -1) state.locales[index] = action.payload;
                state.success = "superadmin.successLocalUpdated";
            })
            .addCase(updateLocal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteLocal.pending, (state) => { state.loading = true; })
            .addCase(deleteLocal.fulfilled, (state, action) => {
                state.loading = false;
                state.locales = state.locales.filter(l => l.id !== action.payload.id);
                state.success = "superadmin.successLocalDeleted";
            })
            .addCase(deleteLocal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            
            .addCase(fetchAdmins.fulfilled, (state, action) => {
                state.admins = action.payload;
            })

            
            .addCase(createAdmin.pending, (state) => { state.loading = true; })
            .addCase(createAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.admins.push(action.payload);
                state.success = "superadmin.successAdminCreated";
            })
            .addCase(createAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            
            .addCase(updateAdmin.pending, (state) => { state.loading = true; })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.admins.findIndex(a => a.id === action.payload.id);
                if (index !== -1) state.admins[index] = action.payload;
                state.success = "superadmin.successAdminUpdated";
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearStatus } = superAdminSlice.actions;
export default superAdminSlice.reducer;
