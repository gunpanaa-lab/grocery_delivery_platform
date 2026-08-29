import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';
import { signup } from '../services/authService';

// Sub Task 1.7 — frontend unit tests for the signup flow (GROC-2).
jest.mock('../services/authService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function fillValidForm(user) {
  return Promise.resolve()
    .then(() => user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace'))
    .then(() => user.type(screen.getByLabelText(/email/i), 'ada@example.com'))
    .then(() => user.type(screen.getByLabelText(/address/i), '123 St 4066'))
    .then(() => user.type(screen.getByLabelText(/date of birth/i), '1990-01-01'))
    .then(() => user.type(screen.getByLabelText(/^password/i), 'supersecret'))
    .then(() => user.type(screen.getByLabelText(/confirm password/i), 'supersecret'));
}

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

describe('Signup page (GROC-2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the role toggle and all required fields', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /buyer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /seller/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('shows validation errors and does not call the API when the form is empty', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  test('submits, shows a success banner, and redirects to /login on success', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    signup.mockResolvedValueOnce({ id: '1', role: 'buyer', token: 'jwt' });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSignup();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/account created/i)).toBeInTheDocument();
    expect(signup).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'buyer' })
    );

    jest.advanceTimersByTime(1200);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { justSignedUp: true } })
    );

    jest.useRealTimers();
  });

  test('shows an error banner when the API rejects the signup', async () => {
    signup.mockRejectedValueOnce({ response: { data: { message: 'Email already registered' } } });
    const user = userEvent.setup();
    renderSignup();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
