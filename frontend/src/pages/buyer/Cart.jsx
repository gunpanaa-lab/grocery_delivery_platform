import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartQuantity, removeFromCart, getCartTotal } from '../../utils/cart';

// Sub Task 6.3 — Cart page matching the Figma Cart / Cart-Empty
// screens: line items with quantity controls and a remove action, a
// subtotal, and an empty state pointing back to the storefront.
export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setItems(updateCartQuantity(productId, quantity));
  };

  const handleRemove = (productId) => {
    setItems(removeFromCart(productId));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl" role="img" aria-label="empty cart">
            🛒
          </span>
        </div>
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add a few items from the shop to get started.</p>
        <Link
          to="/shop"
          className="inline-block w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Your cart</h1>

      <ul className="divide-y divide-gray-200 mb-6">
        {items.map((item) => (
          <li key={item.productId} className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                className="w-8 h-8 border border-gray-300 rounded-lg"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                className="w-8 h-8 border border-gray-300 rounded-lg"
              >
                +
              </button>
              <button
                type="button"
                aria-label={`Remove ${item.name} from cart`}
                onClick={() => handleRemove(item.productId)}
                className="text-sm text-red-600 ml-2"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mb-6 font-medium">
        <span>Subtotal</span>
        <span>${getCartTotal(items).toFixed(2)}</span>
      </div>

      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg"
      >
        Proceed to checkout
      </button>
    </div>
  );
}
