import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    // Si en el futuro necesitas un estado global de functions, ponlo aquí
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
