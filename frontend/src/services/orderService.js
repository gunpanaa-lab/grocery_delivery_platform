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
