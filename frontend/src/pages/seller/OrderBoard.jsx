import { useEffect, useState } from 'react';

const STATUS_LABELS = {
  placed: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

// Sub Task 8.2 — seller Order Management Board, matching the Figma
// Order Management Board-Seller / -Empty screens. Status update
// controls (GROC-76) and the live API connection (GROC-67.3) build on
// top of this structure.
export default function OrderBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Order queue</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet. New orders will show up here.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <li className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Order #{String(order.id).slice(-6)}</span>
        <span className="text-sm text-gray-500">{STATUS_LABELS[order.status] || order.status}</span>
      </div>
      <p className="text-sm text-gray-500 mb-2">Deliver to: {order.deliveryAddress}</p>
      <ul className="text-sm text-gray-700 mb-2">
        {order.items.map((item) => (
          <li key={item.product}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium">Total: ${Number(order.total).toFixed(2)}</p>
    </li>
  );
}
