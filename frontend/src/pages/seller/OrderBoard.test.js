import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderBoard from './OrderBoard';
import { listSellerOrders, updateOrderStatus } from '../../services/orderService';

// Sub Task 8.4 — frontend unit tests for the seller order board (GROC-67).
jest.mock('../../services/orderService', () => ({
  ...jest.requireActual('../../services/orderService'),
  listSellerOrders: jest.fn(),
  updateOrderStatus: jest.fn(),
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

  test('advances an order to the next status', async () => {
    listSellerOrders.mockResolvedValueOnce([
      { id: 'order-123456', status: 'placed', deliveryAddress: '123 St 4066', items: [], total: 5 },
    ]);
    updateOrderStatus.mockResolvedValueOnce({
      id: 'order-123456',
      status: 'preparing',
      deliveryAddress: '123 St 4066',
      items: [],
      total: 5,
    });
    const user = userEvent.setup();
    render(<OrderBoard />);

    await screen.findByText('Placed');
    await user.click(screen.getByRole('button', { name: /mark as preparing/i }));

    expect(updateOrderStatus).toHaveBeenCalledWith('order-123456', 'preparing');
    expect(await screen.findByText('Preparing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark as out for delivery/i })).toBeInTheDocument();
  });

  test('does not show an advance button once an order is delivered', async () => {
    listSellerOrders.mockResolvedValueOnce([
      { id: 'order-123456', status: 'delivered', deliveryAddress: '123 St 4066', items: [], total: 5 },
    ]);
    render(<OrderBoard />);

    await screen.findByText('Delivered');
    expect(screen.queryByRole('button', { name: /mark as/i })).not.toBeInTheDocument();
  });
});
