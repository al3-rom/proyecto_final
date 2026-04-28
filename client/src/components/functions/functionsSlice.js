import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    
};

export const functionsSlice = createSlice({
    name: "functions",
    initialState,
    reducers: {
        clearFunctionsState: () => initialState
    }
});

export const { clearFunctionsState } = functionsSlice.actions;

export default functionsSlice.reducer;




