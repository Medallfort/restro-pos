import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice"
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";

const store = configureStore({
    reducer: {
        customer: customerSlice,
        cart : cartSlice,
        user : userSlice
    },

    // Vite ma 3ndoch import.meta.env.NODE_ENV (dima undefined) -> kan devTools dima actif f production
    devTools: import.meta.env.DEV,
});

export default store;