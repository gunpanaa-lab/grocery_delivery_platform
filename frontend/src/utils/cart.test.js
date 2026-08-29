import { addToCart, updateCartQuantity, removeFromCart, clearCart, getCart, getCartTotal } from './cart';

// Sub Task 6.4 — unit tests for the cart utility module (GROC-49).
describe('cart utilities', () => {
  beforeEach(() => {
    clearCart();
  });

  const apple = { id: 'p1', name: 'Apples', price: 2.5, seller: 'seller-1' };
  const milk = { id: 'p2', name: 'Milk', price: 3, seller: 'seller-1' };

  test('addToCart adds a new line item', () => {
    const items = addToCart(apple);
    expect(items).toEqual([
      { productId: 'p1', seller: 'seller-1', name: 'Apples', price: 2.5, quantity: 1 },
    ]);
    expect(getCart()).toEqual(items);
  });

  test('addToCart increments quantity for an existing item', () => {
    addToCart(apple);
    const items = addToCart(apple, 2);
    expect(items).toEqual([
      { productId: 'p1', seller: 'seller-1', name: 'Apples', price: 2.5, quantity: 3 },
    ]);
  });

  test('updateCartQuantity sets a new quantity', () => {
    addToCart(apple);
    const items = updateCartQuantity('p1', 5);
    expect(items[0].quantity).toBe(5);
  });

  test('updateCartQuantity removes the item when quantity drops to 0', () => {
    addToCart(apple);
    const items = updateCartQuantity('p1', 0);
    expect(items).toEqual([]);
  });

  test('removeFromCart removes only the targeted item', () => {
    addToCart(apple);
    addToCart(milk);
    const items = removeFromCart('p1');
    expect(items).toEqual([{ productId: 'p2', seller: 'seller-1', name: 'Milk', price: 3, quantity: 1 }]);
  });

  test('getCartTotal sums price * quantity across items', () => {
    addToCart(apple, 2);
    addToCart(milk, 1);
    expect(getCartTotal(getCart())).toBeCloseTo(8);
  });

  test('clearCart empties the cart', () => {
    addToCart(apple);
    clearCart();
    expect(getCart()).toEqual([]);
  });
});
