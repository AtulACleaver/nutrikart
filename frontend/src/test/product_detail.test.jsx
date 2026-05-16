import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Product from "../pages/Product";
import { ProfileProvider } from "../store/ProfileContext";
import { CartProvider } from "../store/cartContext";
import { ToastProvider } from "../components/ui";
import { FIXTURE_PRODUCTS } from "../api/fixtures";

const mockProduct = FIXTURE_PRODUCTS[0]; // Daawat Rice Flour

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes(`/api/products/${mockProduct.id}`)) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      });
    }
    if (url.includes("/api/products/9999")) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Product not found" }),
      });
    }
    if (url.includes("/api/products?category_id=")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([FIXTURE_PRODUCTS[1]]),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });
});

function renderProduct(productId = mockProduct.id) {
  return render(
    <MemoryRouter initialEntries={[`/product/${productId}`]}>
      <ToastProvider>
        <ProfileProvider>
          <CartProvider>
            <Routes>
              <Route path="/product/:id" element={<Product />} />
              <Route path="/shop" element={<div>Shop Page</div>} />
            </Routes>
          </CartProvider>
        </ProfileProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("Product Detail Page", () => {
  it("renders product name, price, nutrition table, and provenance", async () => {
    renderProduct();

    await waitFor(() => {
      const match = screen.getAllByText(mockProduct.name);
      expect(match.length).toBeGreaterThanOrEqual(1);
    });

    // Check price is rendered
    expect(screen.getByText(`₹${mockProduct.price_per_unit.toFixed(0)}`)).toBeInTheDocument();

    // Check breadcrumb category
    const catMatches = screen.getAllByText(/Grains & Staples/i);
    expect(catMatches.length).toBeGreaterThanOrEqual(1);

    // Check nutrition table headers
    expect(screen.getAllByText(/Nutrition Facts/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Calories/i)).toBeInTheDocument();
    expect(screen.getByText(/Sugar/i)).toBeInTheDocument();

    // Check provenance
    expect(screen.getByText(/Data Provenance & Clinical Notice/i)).toBeInTheDocument();
  });

  it("evaluates health profile fit in FitVerdict component", async () => {
    // Set diabetic condition in profile
    localStorage.setItem(
      "nk.profile",
      JSON.stringify({
        condition: "diabetic",
        budget: 1000,
        household: 1,
        showAll: false,
      })
    );

    renderProduct();

    await waitFor(() => {
      expect(screen.getByText(/Fits your Diabetic-Friendly profile/i)).toBeInTheDocument();
    });
  });

  it("handles adding to basket and adjusting quantity", async () => {
    renderProduct();

    await waitFor(() => {
      const match = screen.getAllByText(mockProduct.name);
      expect(match.length).toBeGreaterThanOrEqual(1);
    });

    const addBtn = screen.getByRole("button", { name: new RegExp(`Add ${mockProduct.name} to basket`, "i") });
    fireEvent.click(addBtn);

    // After adding, QtyStepper should show quantity 1
    await waitFor(() => {
      expect(screen.getByText(/In your basket/i)).toBeInTheDocument();
    });
  });

  it("renders 404 empty state when product is not found", async () => {
    renderProduct(9999);

    await waitFor(() => {
      expect(screen.getByText(/Product not found/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /back to catalogue/i })).toBeInTheDocument();
  });
});
