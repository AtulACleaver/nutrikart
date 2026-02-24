import { api } from "./client";

export const getCategories = async () => (await api.get("/categories")).data;

export const getProducts = async ({ categoryId } = {}) => {
	const params = {};
	if (categoryId) params.category_id = categoryId;
	return (await api.get("/products", { params })).data;
};

export const getProduct = async (id) => (await api.get(`/products/${id}`)).data;