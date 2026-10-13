import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderHistory from './OrderHistory';
import { getOrderHistory } from '../../services/orderService';

// New — frontend unit tests for the buyer Order History page.
jest.mock('../../services/orderService', () => ({
  ...jest.requireActual('../../services/orderService'),
  getOrderHistory: jest.fn(),
}));

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={['/orders/history']}>
      <Routes>
        <Route path="/orders/history" element={<OrderHistory />} />
        <Route path="/orders/:id" element={<p>tracking page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrderHistory page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows a loading state before the request resolves', () => {
    getOrderHistory.mockReturnValueOnce(new Promise(() => {}));
    renderHistory();

    expect(screen.getByText(/loading your orders/i)).toBeInTheDocument();
  });

  test('lists each past order with its status, date, total, and a tracking link', async () => {
    getOrderHistory.mockResolvedValueOnce([
      {
        id: 'order-123456',
        status: 'delivered',
        deliveryAddress: '123 St 4066',
        total: 12.5,
        createdAt: '2026-09-01T10:00:00.000Z',
      },
    ]);
    renderHistory();

    expect(await screen.findByText(/order #123456/i)).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText(/123 St 4066/)).toBeInTheDocument();
    expect(screen.getByText('Total: $12.50')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /track order/i })).toHaveAttribute(
      'href',
      '/orders/order-123456'
    );
  });

  test('shows an empty state when the buyer has no past orders', async () => {
    getOrderHistory.mockResolvedValueOnce([]);
    renderHistory();

    expect(await screen.findByText(/haven't placed any orders yet/i)).toBeInTheDocument();
  });

  test('shows an error message when the request fails', async () => {
    getOrderHistory.mockRejectedValueOnce(new Error('network error'));
    renderHistory();

    expect(await screen.findByText(/could not load your order history/i)).toBeInTheDocument();
  });
});
