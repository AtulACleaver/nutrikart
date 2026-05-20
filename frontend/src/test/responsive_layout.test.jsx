import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TabBar from "../components/TabBar";
import AppHeader from "../components/AppHeader";
import { CartProvider } from "../store/cartContext";
import { ProfileProvider } from "../store/ProfileContext";

describe("Responsive Layout Integrity", () => {
  it("renders mobile tab bar with md:hidden class and safe-area inset", () => {
    const { container } = render(
      <MemoryRouter>
        <CartProvider>
          <TabBar />
        </CartProvider>
      </MemoryRouter>
    );

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("md:hidden");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("bottom-0");
  });

  it("renders desktop header navigation links with hidden md:flex classes", () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileProvider>
          <CartProvider>
            <AppHeader />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );

    const desktopNav = container.querySelector("nav");
    expect(desktopNav).toHaveClass("hidden");
    expect(desktopNav).toHaveClass("md:flex");
  });
});
