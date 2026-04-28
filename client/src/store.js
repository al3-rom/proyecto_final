import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./components/auth/authSlice";
import functionsReducer from "./components/functions/functionsSlice";
import adminReducer from "./components/functions/admin/adminSlice";
import userReducer from "./components/functions/user/userSlice";
import staffReducer from "./components/functions/staff/staffSlice";
import superAdminReducer from "./components/functions/superadmin/superAdminSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        functions: functionsReducer,
        admin: adminReducer,
        user: userReducer,
        staff: staffReducer,
        superadmin: superAdminReducer,
    },
});



