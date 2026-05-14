import React from "react";
import { Chip } from "./ui";

export default function CategoryChips({ categories = [], activeId, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="Product categories"
      className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none"
    >
      <Chip
        selected={activeId === null}
        onClick={() => onSelect(null)}
      >
        All Products
      </Chip>
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          selected={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </Chip>
      ))}
    </div>
  );
}
