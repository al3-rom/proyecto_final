import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderInfo: null,
    status: "idle",
    error: null,
    loading: false
};

export const staffSlice = createSlice({
    name: "staff",
    initialState,
    reducers: {
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        resetStaffState: (state) => {
            state.orderInfo = null;
            state.status = "idle";
            state.error = null;
            state.loading = false;
        },
        setOrderInfo: (state, action) => {
            state.orderInfo = action.payload;
            state.status = "result";
            state.loading = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.status = "error";
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setStatus, resetStaffState, setOrderInfo, setError, setLoading } = staffSlice.actions;

export default staffSlice.reducer;




