import { api, isFixtureMode } from "./client";
import { FIXTURE_CATEGORIES, FIXTURE_PRODUCTS, FIXTURE_PROFILE_RULES } from "./fixtures";

export const getCategories = async () => {
  if (isFixtureMode()) {
    return FIXTURE_CATEGORIES;
  }
  return (await api.get("/categories/")).data;
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
  return (await api.get("/products/", { params })).data;
};

export const getProduct = async (id) => {
  if (isFixtureMode()) {
    const found = FIXTURE_PRODUCTS.find((p) => p.id === Number(id));
    if (!found) throw new Error("Product not found in fixtures");
    return found;
  }
  return (await api.get(`/products/${id}`)).data;
};

export const getProfileRules = async () => {
  if (isFixtureMode()) {
    return FIXTURE_PROFILE_RULES;
  }
  return (await api.get("/profile-rules")).data;
};
