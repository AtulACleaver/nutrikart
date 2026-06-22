import { api, isFixtureMode } from "./client";
import { FIXTURE_CATEGORIES, FIXTURE_PRODUCTS, FIXTURE_PROFILE_RULES } from "./fixtures";

export const getCategories = async () => {
  if (isFixtureMode()) {
    return FIXTURE_CATEGORIES;
  }
  try {
    const res = await api.get("/categories/");
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return FIXTURE_CATEGORIES;
  } catch (err) {
    console.warn("Categories endpoint offline, using local catalogue fallback:", err.message);
    return FIXTURE_CATEGORIES;
  }
};

export const getProducts = async ({ categoryId } = {}) => {
  if (isFixtureMode()) {
    if (categoryId) {
      return FIXTURE_PRODUCTS.filter((p) => p.category_id === categoryId);
    }
    return FIXTURE_PRODUCTS;
  }
  const params = {};
  if (categoryId) params.category_id = categoryId;

  try {
    const res = await api.get("/products/", { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return categoryId
      ? FIXTURE_PRODUCTS.filter((p) => p.category_id === categoryId)
      : FIXTURE_PRODUCTS;
  } catch (err) {
    console.warn("Products endpoint offline, using verified local catalogue fallback:", err.message);
    return categoryId
      ? FIXTURE_PRODUCTS.filter((p) => p.category_id === categoryId)
      : FIXTURE_PRODUCTS;
  }
};

export const getProduct = async (id) => {
  if (isFixtureMode()) {
    const found = FIXTURE_PRODUCTS.find((p) => p.id === Number(id));
    if (!found) throw new Error("Product not found in fixtures");
    return found;
  }
  try {
    const res = await api.get(`/products/${id}`);
    if (res.data) return res.data;
  } catch (err) {
    console.warn(`Product ${id} endpoint offline, using local fixture:`, err.message);
  }
  const found = FIXTURE_PRODUCTS.find((p) => p.id === Number(id));
  if (found) return found;
  throw new Error(`Product ${id} not found`);
};

export const getProfileRules = async () => {
  if (isFixtureMode()) {
    return FIXTURE_PROFILE_RULES;
  }
  try {
    const res = await api.get("/profile-rules");
    if (res.data) return res.data;
  } catch (err) {
    console.warn("Profile rules endpoint offline, using local rules:", err.message);
  }
  return FIXTURE_PROFILE_RULES;
};
