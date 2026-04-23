import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./components/auth/authSlice";
import functionsReducer from "./components/functions/functionsSLice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        functions: functionsReducer,
    },
});