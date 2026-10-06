import { createSlice } from "@reduxjs/toolkit";

// Max dyal backend (createOrderSchema)
export const MAX_QUANTITY = 20;

const initialState = [];

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        // Ila l-plat deja f panier, kanzidou l-quantite (bla doublons)
        addItems : (state, action) => {
            const { name, pricePerQuantity, quantity } = action.payload;
            const existing = state.find(item => item.name === name);
            if (existing) {
                existing.quantity = Math.min(existing.quantity + quantity, MAX_QUANTITY);
                existing.price = existing.pricePerQuantity * existing.quantity;
                return;
            }
            state.push({ ...action.payload, quantity: Math.min(quantity, MAX_QUANTITY), price: pricePerQuantity * Math.min(quantity, MAX_QUANTITY) });
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id != action.payload);
        },

        removeAllItems: () => {
            return [];
        }
    }
})

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, removeItem, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;
