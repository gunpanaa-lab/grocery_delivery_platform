import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory } from '../../services/orderService';

function OrderHistoryCard({ order }) {
  const shortId = order.id.replace(/^order-/, '');
  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
  const placedOn = new Date(order.createdAt).toLocaleDateString();

  return (
    <li className="order-history-card">
      <div className="order-history-card__header">
        <span>Order #{shortId}</span>
        <span className={`status-badge status-badge--${order.status}`}>{statusLabel}</span>
      </div>
      <p>Deliver to: {order.deliveryAddress}</p>
      <p>Placed on {placedOn}</p>
      <p>Total: ${order.total.toFixed(2)}</p>
      <Link to={`/orders/${order.id}`}>Track order</Link>
    </li>
  );
}

export default function OrderHistory() {
  // orders === null while the request is in flight; [] once loaded with
  // no past orders; an array of orders once loaded with data.
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
    return <p role="alert">{error}</p>;
  }

  if (orders === null) {
    return <p>Loading your orders…</p>;
  }

  if (orders.length === 0) {
    return <p>You haven't placed any orders yet.</p>;
  }

  return (
    <section className="order-history">
      <h1>Order History</h1>
      <ul>
        {orders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} />
        ))}
      </ul>
    </section>
  );
}
