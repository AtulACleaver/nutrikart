import React, { useMemo, useReducer } from "react";
import { CartContext } from "./cartContext";

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
    case "SET_QTY": {
      const { productId, quantity } = action;
      const next = { ...state.items };
      if (quantity <= 0) delete next[productId];
      else if (next[productId]) {
        next[productId] = { ...next[productId], quantity };
      }
      return { ...state, items: next };
    }
    case "CLEAR":
      return { items: {} };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: {} });

  const value = useMemo(() => {
    const entries = Object.values(state.items);
    const totalItems = entries.reduce((a, e) => a + e.quantity, 0);
    const totalCost = entries.reduce(
      (a, e) => a + (Number(e.product.price_per_unit) || 0) * e.quantity,
      0,
    );
    return {
      itemsById: state.items,
      entries,
      totalItems,
      totalCost,
      add: (product, qty = 1) => dispatch({ type: "ADD", product, qty }),
      setQty: (productId, quantity) =>
        dispatch({ type: "SET_QTY", productId, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
