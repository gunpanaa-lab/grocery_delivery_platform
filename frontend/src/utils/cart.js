const STORAGE_KEY = 'grocer_cart';

// Sub Task 6.1 — cart storage backed by localStorage (GROC-49), so a
// buyer's cart survives a page refresh without needing a backend cart
// model. Each line item is { productId, name, price, quantity }.

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function getCart() {
  return readCart();
}

export function addToCart(product, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      // Carried through to checkout (GROC-58): an order is scoped to a
      // single seller, so the seller id travels with the line item
      // rather than requiring a second lookup at checkout time.
      seller: product.seller,
      name: product.name,
      price: product.price,
      quantity,
    });
  }
  return writeCart(items);
}

export function updateCartQuantity(productId, quantity) {
  let items = readCart();
  if (quantity <= 0) {
    items = items.filter((item) => item.productId !== productId);
  } else {
    items = items.map((item) => (item.productId === productId ? { ...item, quantity } : item));
  }
  return writeCart(items);
}

export function removeFromCart(productId) {
  const items = readCart().filter((item) => item.productId !== productId);
  return writeCart(items);
}

export function clearCart() {
  return writeCart([]);
}

export function getCartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
