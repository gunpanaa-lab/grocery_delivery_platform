import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Cart from './Cart';
import { addToCart, clearCart } from '../../utils/cart';

// Sub Task 6.4 — frontend unit tests for the Cart page (GROC-49).
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderCart() {
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );
}

describe('Cart page (GROC-49)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCart();
  });

  test('shows the empty state with a link back to the shop', () => {
    renderCart();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start shopping/i })).toHaveAttribute('href', '/shop');
  });

  test('lists items and shows the subtotal', () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5 }, 2);
    renderCart();

    expect(screen.getByText('Apples')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
  });

  test('increasing quantity updates the displayed subtotal', async () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5 }, 1);
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole('button', { name: /increase quantity of apples/i }));

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
  });

  test('removing the only item falls back to the empty state', async () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5 }, 1);
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole('button', { name: /remove apples from cart/i }));

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  test('proceeding to checkout navigates to /checkout', async () => {
    addToCart({ id: 'p1', name: 'Apples', price: 2.5 }, 1);
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole('button', { name: /proceed to checkout/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
});
