import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, getCartTotal } from '../../utils/cart';
import { placeOrder } from '../../services/orderService';

// Sub Task 7.2 — Checkout page matching the Figma Checkout screen:
// order summary, delivery address, and pay-on-delivery as the only
// payment method (per the backlog's scope for GROC-58).
export default function Checkout() {
  const navigate = useNavigate();
  const [items] = useState(() => getCart());
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!address.trim()) {
      setError('A delivery address is required.');
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({ items, deliveryAddress: address.trim() });
    } catch (err) {
      const data = err?.response?.data;
      setError(data?.message || 'Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add items to your cart before checking out.</p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg"
        >
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Order summary</h2>
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg px-4">
          {items.map((item) => (
            <li key={item.productId} className="py-3 flex items-center justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between font-medium mt-3">
          <span>Total</span>
          <span>${getCartTotal(items).toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Delivery address *
          </label>
          <input
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex. 123 St 4066"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium mb-1">Payment method</h2>
          <div className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600">
            Pay on delivery
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg"
        >
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
