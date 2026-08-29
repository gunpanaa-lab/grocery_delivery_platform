import api from '../axiosConfig';

// Sub Task 7.3 — connect checkout to the backend (GROC-58).
export async function placeOrder({ items, deliveryAddress }) {
  const { data } = await api.post('/orders', {
    items: items.map((item) => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    seller: items[0]?.seller,
    deliveryAddress,
  });
  return data;
}

// Seller live order queue (GROC-67).
export async function listSellerOrders() {
  const { data } = await api.get('/orders/mine');
  return data;
}

// Seller order status update controls (GROC-76).
export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}
