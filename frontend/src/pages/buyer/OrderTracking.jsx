import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder, cancelOrder } from '../../services/orderService';

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
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

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

  // GDP-119 (FR-13) — the backend decides if the cancel is allowed.
  // The page only shows the new status or the server's error message.
  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await cancelOrder(id);
      setOrder(updated);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Could not cancel this order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

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
  const isOrderCancelled = order.status === 'cancelled';
  const canCancel = order.status === 'placed';

  return (
    <div className="max-w-md mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-center mb-2">
        {isOrderCancelled
          ? 'Order cancelled'
          : order.status === 'delivered'
            ? 'Delivered!'
            : 'Tracking your order'}
      </h1>
      <p className="text-gray-500 text-center mb-8">Order #{String(order.id).slice(-6)}</p>

      {isOrderCancelled ? (
        <div className="flex justify-center mb-8">
          <span className="inline-block bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
            Cancelled
          </span>
        </div>
      ) : (
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
      )}

      {canCancel && (
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm border border-red-300 text-red-700 rounded-lg px-4 py-2 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </button>
        </div>
      )}

      {cancelError && <p className="text-red-600 text-sm text-center mb-4">{cancelError}</p>}

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500 mb-1">Deliver to</p>
        <p className="text-sm mb-4">{order.deliveryAddress}</p>
        <p className="text-sm font-medium">Total: ${Number(order.total).toFixed(2)}</p>
      </div>
    </div>
  );
}