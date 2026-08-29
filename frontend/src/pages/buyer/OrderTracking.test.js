import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderTracking from './OrderTracking';
import { getOrder } from '../../services/orderService';

// Sub Task 10.4 — frontend unit tests for the Order Tracking page (GROC-86).
jest.mock('../../services/orderService', () => ({
  ...jest.requireActual('../../services/orderService'),
  getOrder: jest.fn(),
}));

function renderTracking(id = 'order-123456') {
  return render(
    <MemoryRouter initialEntries={[`/orders/${id}`]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderTracking />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrderTracking page (GROC-86)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and shows the order id, address, and total', async () => {
    getOrder.mockResolvedValueOnce({
      id: 'order-123456',
      status: 'preparing',
      deliveryAddress: '123 St 4066',
      total: 5,
    });
    renderTracking();

    expect(await screen.findByText(/order #123456/i)).toBeInTheDocument();
    expect(screen.getByText('123 St 4066')).toBeInTheDocument();
    expect(screen.getByText('Total: $5.00')).toBeInTheDocument();
    expect(getOrder).toHaveBeenCalledWith('order-123456');
  });

  test('highlights steps up to the current status', async () => {
    getOrder.mockResolvedValueOnce({
      id: 'order-123456',
      status: 'preparing',
      deliveryAddress: '123 St 4066',
      total: 5,
    });
    renderTracking();

    await screen.findByText('Preparing');
    // Placed and Preparing are reached (checkmarks); the later steps are not.
    expect(screen.getAllByText('✓')).toHaveLength(2);
  });

  test("shows a 'Delivered!' heading once the order is delivered", async () => {
    getOrder.mockResolvedValueOnce({
      id: 'order-123456',
      status: 'delivered',
      deliveryAddress: '123 St 4066',
      total: 5,
    });
    renderTracking();

    expect(await screen.findByRole('heading', { name: /delivered!/i })).toBeInTheDocument();
  });

  test('shows an error message when the request fails', async () => {
    getOrder.mockRejectedValueOnce(new Error('network error'));
    renderTracking();

    expect(await screen.findByText(/could not load this order/i)).toBeInTheDocument();
  });
});
