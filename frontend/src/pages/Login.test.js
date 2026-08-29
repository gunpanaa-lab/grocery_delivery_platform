import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { login } from '../services/authService';
import { getStoredUser, clearStoredUser } from '../utils/session';

// Sub Task 2.7 — frontend unit tests for the login flow (GROC-11).
jest.mock('../services/authService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page (GROC-11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearStoredUser();
  });

  test('renders the email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('shows validation errors and does not call the API for an empty form', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  test('stores the session and redirects a buyer to /shop on success', async () => {
    login.mockResolvedValueOnce({ id: '1', role: 'buyer', email: 'ada@example.com', token: 'jwt' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'supersecret');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await screen.findByRole('button', { name: /log in/i });
    expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'supersecret' });
    expect(getStoredUser()).toEqual(expect.objectContaining({ role: 'buyer', token: 'jwt' }));
    expect(mockNavigate).toHaveBeenCalledWith('/shop', { replace: true });
  });

  test('redirects a seller to /seller on success', async () => {
    login.mockResolvedValueOnce({ id: '2', role: 'seller', email: 'store@example.com', token: 'jwt2' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'store@example.com');
    await user.type(screen.getByLabelText(/password/i), 'supersecret');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await screen.findByRole('button', { name: /log in/i });
    expect(mockNavigate).toHaveBeenCalledWith('/seller', { replace: true });
  });

  test('shows an error banner and does not navigate on invalid credentials', async () => {
    login.mockRejectedValueOnce({ response: { data: { message: 'Invalid email or password' } } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(getStoredUser()).toBeNull();
  });
});
