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
