import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Shop from "../pages/Shop";
import { ProfileProvider } from "../store/ProfileContext";
import { CartProvider } from "../store/cartContext";
import { ToastProvider } from "../components/ui";
import { FIXTURE_PRODUCTS, FIXTURE_CATEGORIES } from "../api/fixtures";

// Mock fetch so Shop loads FIXTURE_PRODUCTS and FIXTURE_CATEGORIES
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes("/api/products")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(FIXTURE_PRODUCTS),
      });
    }
    if (url.includes("/api/categories")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(FIXTURE_CATEGORIES),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });
});

function renderShop() {
  return render(
    <MemoryRouter initialEntries={["/shop"]}>
      <ToastProvider>
        <ProfileProvider>
          <CartProvider>
            <Shop />
          </CartProvider>
        </ProfileProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("Shop catalogue and filter experience", () => {
  it("renders catalogue and allows searching by food name", async () => {
    renderShop();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText(/Daawat Rice Flour/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search food or category/i);
    fireEvent.change(searchInput, { target: { value: "Amul" } });

    // Amul Curd should be visible, while Daawat Rice Flour should not be visible
    expect(screen.getByText(/Amul Masti Pouch Curd/i)).toBeInTheDocument();
    expect(screen.queryByText(/Daawat Rice Flour/i)).not.toBeInTheDocument();
  });

  it("filters items by active category chip", async () => {
    renderShop();

    await waitFor(() => {
      expect(screen.getByText(/Daawat Rice Flour/i)).toBeInTheDocument();
    });

    // Click on Dairy & Cheese chip
    const dairyChip = screen.getByRole("button", { name: /dairy & cheese/i });
    fireEvent.click(dairyChip);

    // Amul Curd (dairy) should match, Daawat Rice Flour (grains) should not
    await waitFor(() => {
      expect(screen.getByText(/Amul Masti Pouch Curd/i)).toBeInTheDocument();
      expect(screen.queryByText(/Daawat Rice Flour/i)).not.toBeInTheDocument();
    });
  });

  it("evaluates health condition and shows profile filter banner", async () => {
    // Seed profile in localStorage with diabetic condition
    localStorage.setItem(
      "nk.profile",
      JSON.stringify({
        condition: "diabetic",
        budget: 1500,
        household: 2,
        showAll: false,
      })
    );

    renderShop();

    await waitFor(() => {
      expect(screen.getByText(/Filtered by Diabetic-Friendly/i)).toBeInTheDocument();
    });

    // Check stats banner has verified fits, outside limits, unknown
    expect(screen.getByText(/verified fits/i)).toBeInTheDocument();
  });

  it("displays empty state when search term has no match", async () => {
    renderShop();

    await waitFor(() => {
      expect(screen.getByText(/Daawat Rice Flour/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search food or category/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentUnobtainiumItem123" } });

    await waitFor(() => {
      expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText(/Daawat Rice Flour/i)).toBeInTheDocument();
    });
  });
});
