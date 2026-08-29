import api from '../axiosConfig';

export const CATEGORIES = ['produce', 'dairy', 'bakery', 'meat', 'pantry', 'beverages', 'household', 'other'];

// Seller endpoints (GROC-21) — require an authenticated seller.
export async function listMyProducts() {
  const { data } = await api.get('/products/mine');
  return data;
}

export async function createProduct(product) {
  const { data } = await api.post('/products', product);
  return data;
}

export async function updateProduct(id, product) {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

// GROC-30 — inventory stock status toggle.
export async function setProductStock(id, inStock) {
  const { data } = await api.patch(`/products/${id}/stock`, { inStock });
  return data;
}

// Buyer endpoint (GROC-39) — public storefront browsing/search.
export async function browseProducts({ search = '', category = '' } = {}) {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  const { data } = await api.get('/products', { params });
  return data;
}
