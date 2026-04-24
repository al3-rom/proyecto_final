import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./components/auth/authSlice";
import functionsReducer from "./components/functions/functionsSLice";
import adminReducer from "./components/functions/admin/adminSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        functions: functionsReducer,
        admin: adminReducer,
    },
});