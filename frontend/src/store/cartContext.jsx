import React, { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "nutrikart_cart";

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { items: JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return { items: {} };
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { product, qty } = action;
      const existing = state.items[product.id] || { product, quantity: 0 };
      const nextQty = existing.quantity + qty;
      return {
        ...state,
        items: {
          ...state.items,
          [product.id]: { product, quantity: nextQty },
        },
      };
    }
    case "MERGE_ITEMS": {
      const next = { ...state.items };
      for (const item of action.items) {
        const prod = item.product || item;
        const addQty = item.quantity ?? 1;
        if (addQty <= 0) continue;

        const existing = next[prod.id] || { product: prod, quantity: 0 };
        next[prod.id] = {
          product: { ...existing.product, ...prod },
          quantity: existing.quantity + addQty,
        };
      }
      return { ...state, items: next };
    }
    case "RESTORE_ITEMS": {
      return { items: action.items || {} };
    }
    case "SET_QTY": {
      const { productId, quantity } = action;
      const next = { ...state.items };
      if (quantity <= 0) delete next[productId];
      else next[productId] = { ...next[productId], quantity };
      return { ...state, items: next };
    }
    case "CLEAR":
      return { items: {} };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.warn("Unable to persist cart to localStorage", e);
    }
  }, [state.items]);

  const add = useCallback((product, qty = 1) => dispatch({ type: "ADD", product, qty }), []);
  const mergeItems = useCallback((items) => dispatch({ type: "MERGE_ITEMS", items }), []);
  const restoreItems = useCallback((items) => dispatch({ type: "RESTORE_ITEMS", items }), []);
  const setQty = useCallback((productId, quantity) => dispatch({ type: "SET_QTY", productId, quantity }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo(() => {
    const entries = Object.values(state.items);
    const totalItems = entries.reduce((a, e) => a + e.quantity, 0);
    const totalCost = entries.reduce(
      (a, e) => a + (Number(e.product.price_per_unit) || 0) * e.quantity,
      0
    );
    return {
      itemsById: state.items,
      entries,
      totalItems,
      totalCost,
      add,
      mergeItems,
      restoreItems,
      setQty,
      clear,
    };
  }, [state.items, add, mergeItems, restoreItems, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
