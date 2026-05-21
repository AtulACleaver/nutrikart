import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Button, Chip, QtyStepper, ToastProvider, useToast } from "../components/ui";
import { ConditionPicker } from "../components/ConditionPicker";
import { ProductCard } from "../components/ProductCard";
import { CartProvider } from "../store/cartContext";
import { ProfileProvider } from "../store/ProfileContext";
import { FIXTURE_PRODUCTS } from "../api/fixtures";

function ToastTestComponent() {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Test notification")}>
      Trigger Toast
    </button>
  );
}

describe("Accessibility Standards & Keyboard Navigation", () => {
  it("provides minimum 44px touch target height and focus-visible ring on buttons", () => {
    render(<Button variant="basket" size="lg">Add to basket</Button>);
    const btn = screen.getByRole("button", { name: /add to basket/i });
    expect(btn).toHaveClass("focus-visible:outline");
    expect(btn).toHaveClass("h-[52px]"); // > 44px
  });

  it("ensures QtyStepper controls are accessible buttons with aria-labels", () => {
    const handleChange = vi.fn();
    render(<QtyStepper value={2} onChange={handleChange} />);
    const decBtn = screen.getByRole("button", { name: /decrease quantity/i });
    const incBtn = screen.getByRole("button", { name: /increase quantity/i });

    expect(decBtn).toBeInTheDocument();
    expect(incBtn).toBeInTheDocument();

    fireEvent.click(incBtn);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("supports keyboard arrow navigation within ConditionPicker radiogroup", () => {
    const handleChange = vi.fn();
    render(
      <ConditionPicker
        value="diabetic"
        onChange={handleChange}
        variant="cards"
      />
    );

    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();

    const diabeticRadio = screen.getByRole("radio", { name: /diabetic-friendly/i });
    expect(diabeticRadio).toHaveAttribute("aria-checked", "true");

    // Navigate with ArrowDown
    fireEvent.keyDown(diabeticRadio, { key: "ArrowDown" });
    expect(handleChange).toHaveBeenCalledWith("hypertension");

    // Navigate with ArrowRight
    fireEvent.keyDown(diabeticRadio, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("hypertension");
  });

  it("announces status updates with aria-live polite region in ToastProvider", () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    const triggerBtn = screen.getByRole("button", { name: /trigger toast/i });
    fireEvent.click(triggerBtn);

    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toBeInTheDocument();
    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });

  it("supplies descriptive alt text on ProductCard and handles broken images safely", () => {
    render(
      <MemoryRouter>
        <ProfileProvider>
          <CartProvider>
            <ProductCard p={FIXTURE_PRODUCTS[0]} />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );

    const img = screen.getByAltText(FIXTURE_PRODUCTS[0].name);
    expect(img).toBeInTheDocument();

    // Trigger error to verify fallback does not crash
    fireEvent.error(img);
    expect(screen.getByText(/Photo coming soon/i)).toBeInTheDocument();
  });
});
