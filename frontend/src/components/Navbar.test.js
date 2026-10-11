import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { setStoredUser, clearStoredUser, getStoredUser } from '../utils/session';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearStoredUser();
  });

  test('shows Home/Shop/Order, a cart icon, and Log in when signed out', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /^shop$/i })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('link', { name: /^order$/i })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');
  });

  test('routes Shop/Order to the buyer storefront/cart for a logged-in buyer', () => {
    setStoredUser({ role: 'buyer', name: 'Ada' });
    renderNavbar();
    expect(screen.getByRole('link', { name: /^shop$/i })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('link', { name: /^order$/i })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/cart');
  });

  test("routes Shop/Order to the seller's shop/order queue and hides the cart icon for a logged-in seller", () => {
    setStoredUser({ role: 'seller', name: 'Store' });
    renderNavbar();
    expect(screen.getByRole('link', { name: /^shop$/i })).toHaveAttribute('href', '/seller');
    expect(screen.getByRole('link', { name: /^order$/i })).toHaveAttribute('href', '/seller/orders');
    expect(screen.queryByRole('link', { name: 'Cart' })).not.toBeInTheDocument();
  });

  test('logging out clears the session and returns home', async () => {
    setStoredUser({ role: 'buyer', name: 'Ada' });
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(getStoredUser()).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows an Order History link only for a logged-in buyer', () => {
    renderNavbar();
    expect(screen.queryByRole('link', { name: /history/i })).not.toBeInTheDocument();

    clearStoredUser();
    setStoredUser({ role: 'seller', name: 'Store' });
    renderNavbar();
    expect(screen.queryByRole('link', { name: /history/i })).not.toBeInTheDocument();

    clearStoredUser();
    setStoredUser({ role: 'buyer', name: 'Ada' });
    renderNavbar();
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('href', '/orders/history');
  });
});