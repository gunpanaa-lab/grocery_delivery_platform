import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory } from '../../services/orderService';

const STATUS_STYLES = {
  placed: 'bg-gray-100 text-gray-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  out_for_delivery: 'bg-blue-100 text-blue-700',
  delivered: 'bg-brand-100 text-brand-700',
  cancelled: 'bg-red-100 text-red-700',
};

function OrderHistoryCard({ order }) {
  const shortId = String(order.id).slice(-6);
  const statusLabel = order.status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const placedOn = new Date(order.createdAt).toLocaleDateString();
  const badgeClass = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700';

  return (
    <li className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">Order #{shortId}</span>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">Deliver to: {order.deliveryAddress}</p>
      <p className="text-sm text-gray-500 mb-4">Placed on {placedOn}</p>
      <div className="flex items-center justify-between">
        <Link to={`/orders/${order.id}`} className="text-sm text-brand-700 font-medium hover:underline">
          Track order
        </Link>
        <span className="text-sm font-semibold">Total: ${order.total.toFixed(2)}</span>
      </div>
    </li>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getOrderHistory()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setError('We could not load your order history. Please try again.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p role="alert" className="text-red-600 text-center py-16">{error}</p>;
  }

  if (orders === null) {
    return <p className="text-gray-500 text-center py-16">Loading your orders…</p>;
  }

  if (orders.length === 0) {
    return <p className="text-gray-500 text-center py-16">You haven't placed any orders yet.</p>;
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Order History</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} />
        ))}
      </ul>
    </section>
  );
}