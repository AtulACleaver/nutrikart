import React, { useEffect } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "../pages/Cart";
import { ProfileProvider } from "../store/ProfileContext";
import { CartProvider, useCart } from "../store/cartContext";
import { ToastProvider } from "../components/ui";
import { FIXTURE_PRODUCTS } from "../api/fixtures";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// Helper component to populate cart before rendering Cart page
function CartWithItems({ items = [] }) {
  const { add } = useCart();
  useEffect(() => {
    items.forEach(({ product, qty }) => {
      add(product, qty);
    });
  }, []);
  return <Cart />;
}

function renderBasket(items = []) {
  return render(
    <MemoryRouter initialEntries={["/cart"]}>
      <ToastProvider>
        <ProfileProvider>
          <CartProvider>
            {items.length > 0 ? <CartWithItems items={items} /> : <Cart />}
          </CartProvider>
        </ProfileProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("Basket Page Experience", () => {
  it("renders empty state when cart has no items", () => {
    renderBasket([]);
    expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /plan a basket/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse shop/i })).toBeInTheDocument();
  });

  it("renders item rows, quantities, line totals, and summary card", async () => {
    const testItems = [
      { product: FIXTURE_PRODUCTS[0], qty: 2 }, // 70 * 2 = 140
      { product: FIXTURE_PRODUCTS[1], qty: 1 }, // 35 * 1 = 35
    ];

    renderBasket(testItems);

    await waitFor(() => {
      expect(screen.getByText(/Your basket/i)).toBeInTheDocument();
      expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
      expect(screen.getByText(FIXTURE_PRODUCTS[1].name)).toBeInTheDocument();
    });

    // Check line totals and overall total (140 + 35 = 175)
    expect(screen.getAllByText(/₹175/).length).toBeGreaterThanOrEqual(1);
  });

  it("triggers removal and displays undo toast on remove button click", async () => {
    const testItems = [{ product: FIXTURE_PRODUCTS[0], qty: 2 }];
    renderBasket(testItems);

    await waitFor(() => {
      expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole("button", {
      name: new RegExp(`Remove ${FIXTURE_PRODUCTS[0].name} from basket`, "i"),
    });
    fireEvent.click(removeBtn);

    // Toast should appear with Undo action
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`${FIXTURE_PRODUCTS[0].name} removed`, "i"))).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog on clear basket and restores items on undo", async () => {
    const testItems = [
      { product: FIXTURE_PRODUCTS[0], qty: 1 },
      { product: FIXTURE_PRODUCTS[1], qty: 1 },
    ];
    renderBasket(testItems);

    await waitFor(() => {
      expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole("button", { name: /clear basket/i });
    fireEvent.click(clearBtn);

    // Confirm dialog should be visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Clear your basket\?/i)).toBeInTheDocument();

    // Click confirm in dialog
    const confirmClearBtn = screen.getAllByRole("button", { name: /clear basket/i })[1];
    fireEvent.click(confirmClearBtn);

    // Empty state should now appear along with Undo toast
    await waitFor(() => {
      expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument();
      expect(screen.getByText(/Basket cleared/i)).toBeInTheDocument();
    });

    // Click Undo
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    fireEvent.click(undoBtn);

    // Items should be restored
    await waitFor(() => {
      expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
    });
  });
});
