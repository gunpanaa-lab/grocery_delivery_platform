import { render, screen } from '@testing-library/react';
import OrderBoard from './OrderBoard';
import { listSellerOrders } from '../../services/orderService';

// Sub Task 8.4 — frontend unit tests for the seller order board (GROC-67).
jest.mock('../../services/orderService', () => ({
  ...jest.requireActual('../../services/orderService'),
  listSellerOrders: jest.fn(),
}));

describe('OrderBoard page (GROC-67)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows an empty state when there are no orders', async () => {
    listSellerOrders.mockResolvedValueOnce([]);
    render(<OrderBoard />);

    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument();
  });

  test('renders orders once loaded', async () => {
    listSellerOrders.mockResolvedValueOnce([
      {
        id: 'order-123456',
        status: 'placed',
        deliveryAddress: '123 St 4066',
        items: [{ product: 'p1', name: 'Apples', quantity: 2 }],
        total: 5,
      },
    ]);
    render(<OrderBoard />);

    expect(await screen.findByText(/order #123456/i)).toBeInTheDocument();
    expect(screen.getByText('Placed')).toBeInTheDocument();
    expect(screen.getByText(/apples × 2/i)).toBeInTheDocument();
    expect(screen.getByText('Total: $5.00')).toBeInTheDocument();
  });

  test('shows an error message when the request fails', async () => {
    listSellerOrders.mockRejectedValueOnce(new Error('network error'));
    render(<OrderBoard />);

    expect(await screen.findByText(/could not load your orders/i)).toBeInTheDocument();
  });
});
