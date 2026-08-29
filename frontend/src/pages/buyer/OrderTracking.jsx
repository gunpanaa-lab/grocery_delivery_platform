import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../../services/orderService';

const STEPS = [
  { key: 'placed', label: 'Order placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

// Sub Task 10.2 — Order Tracking page matching the Figma Order
// Tracking / Order Tracking-Delivered screens: a step progress bar
// showing how far the order has advanced. The live API connection is
// added in GROC-86.3.
export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this order. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-gray-500 text-center py-16">Loading your order…</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center py-16">{error}</p>;
  }

  if (!order) {
    return null;
  }

  const currentIndex = STEPS.findIndex((step) => step.key === order.status);

  return (
    <div className="max-w-md mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-center mb-2">
        {order.status === 'delivered' ? 'Delivered!' : 'Tracking your order'}
      </h1>
      <p className="text-gray-500 text-center mb-8">Order #{String(order.id).slice(-6)}</p>

      <ol className="mb-8">
        {STEPS.map((step, index) => (
          <li key={step.key} className="flex items-center gap-3 mb-4 last:mb-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= currentIndex ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index <= currentIndex ? '✓' : index + 1}
            </span>
            <span className={index <= currentIndex ? 'font-medium' : 'text-gray-500'}>{step.label}</span>
          </li>
        ))}
      </ol>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500 mb-1">Deliver to</p>
        <p className="text-sm mb-4">{order.deliveryAddress}</p>
        <p className="text-sm font-medium">Total: ${Number(order.total).toFixed(2)}</p>
      </div>
    </div>
  );
}
