import React, { useEffect } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";
import { ProfileProvider } from "../store/ProfileContext";
import { CartProvider, useCart } from "../store/cartContext";
import { ToastProvider } from "../components/ui";
import { FIXTURE_PRODUCTS } from "../api/fixtures";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function CartWithDrawer({ items = [], open = true, onClose = () => {} }) {
  const { add } = useCart();
  useEffect(() => {
    items.forEach(({ product, qty }) => {
      add(product, qty);
    });
  }, []);
  return <CartDrawer open={open} onClose={onClose} />;
}

function renderDrawer({ items = [], open = true, onClose = () => {} } = {}) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ProfileProvider>
          <CartProvider>
            <CartWithDrawer items={items} open={open} onClose={onClose} />
          </CartProvider>
        </ProfileProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("Cart Drawer", () => {
  it("does not render when open is false", () => {
    renderDrawer({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders empty state when cart is empty", () => {
    renderDrawer({ items: [], open: true });
    expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument();
  });

  it("renders compact item rows and total when items are present", () => {
    const items = [
      { product: FIXTURE_PRODUCTS[0], qty: 2 }, // 70 * 2 = 140
    ];
    renderDrawer({ items, open: true });

    expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
    expect(screen.getAllByText(/₹140/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /view basket/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export pdf/i })).toBeInTheDocument();
  });

  it("closes when Esc key is pressed", () => {
    const onClose = vi.fn();
    renderDrawer({ items: [], open: true, onClose });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when close button is clicked", () => {
    const onClose = vi.fn();
    renderDrawer({ items: [], open: true, onClose });

    const closeBtn = screen.getByRole("button", { name: /close basket drawer/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
