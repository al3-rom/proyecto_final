import { createSlice } from "@reduxjs/toolkit";
import { 
    fetchLocales, createLocal, updateLocal, 
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
            .addCase(createLocal.fulfilled, (state, action) => {
                state.locales.push(action.payload);
                state.success = "Local creado con éxito";
            })
            .addCase(updateLocal.fulfilled, (state, action) => {
                const index = state.locales.findIndex(l => l.id === action.payload.id);
                if (index !== -1) state.locales[index] = action.payload;
                state.success = "Local actualizado con éxito";
            })
  
            .addCase(fetchAdmins.fulfilled, (state, action) => {
                state.admins = action.payload;
            })
            .addCase(createAdmin.fulfilled, (state, action) => {
                state.admins.push(action.payload);
                state.success = "Administrador creado con éxito";
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                const index = state.admins.findIndex(a => a.id === action.payload.id);
                if (index !== -1) state.admins[index] = action.payload;
                state.success = "Administrador actualizado con éxito";
            });
    }
});

export const { clearStatus } = superAdminSlice.actions;
export default superAdminSlice.reducer;




