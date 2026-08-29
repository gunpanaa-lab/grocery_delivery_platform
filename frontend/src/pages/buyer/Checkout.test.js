import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Checkout from './Checkout';
import { addToCart, clearCart, getCart } from '../../utils/cart';
import { placeOrder } from '../../services/orderService';

// Sub Task 7.6 — frontend unit tests for Checkout (GROC-58).
jest.mock('../../services/orderService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderCheckout() {
  return render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  );
}

describe('Checkout page (GROC-58)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCart();
  });

  test("prompts to shop when the cart is empty", () => {
    renderCheckout();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('shows the order summary and total from the cart', () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5, seller: 's1' }, 2);
    renderCheckout();

    expect(screen.getByText(/apples × 2/i)).toBeInTheDocument();
    expect(screen.getAllByText('$5.00')).toHaveLength(2); // line total + order total
  });

  test('requires a delivery address before submitting', async () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5, seller: 's1' }, 1);
    const user = userEvent.setup();
    renderCheckout();

    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findByText(/delivery address is required/i)).toBeInTheDocument();
    expect(placeOrder).not.toHaveBeenCalled();
  });

  test('places the order, clears the cart, and redirects to order tracking', async () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5, seller: 's1' }, 1);
    placeOrder.mockResolvedValueOnce({ id: 'order-1' });
    const user = userEvent.setup();
    renderCheckout();

    await user.type(screen.getByLabelText(/delivery address/i), '123 St 4066');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    await screen.findByRole('button', { name: /place order/i });
    expect(placeOrder).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryAddress: '123 St 4066' })
    );
    expect(getCart()).toEqual([]);
    expect(mockNavigate).toHaveBeenCalledWith('/orders/order-1');
  });

  test('shows an error banner when placing the order fails', async () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5, seller: 's1' }, 1);
    placeOrder.mockRejectedValueOnce({ response: { data: { message: 'Out of stock' } } });
    const user = userEvent.setup();
    renderCheckout();

    await user.type(screen.getByLabelText(/delivery address/i), '123 St 4066');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findByText(/out of stock/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
