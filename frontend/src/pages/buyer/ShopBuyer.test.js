import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShopBuyer from './ShopBuyer';
import { browseProducts } from '../../services/productService';

// Sub Task 5.6 — frontend unit tests for the Shop-Buyer storefront.
jest.mock('../../services/productService', () => ({
  ...jest.requireActual('../../services/productService'),
  browseProducts: jest.fn(),
}));

describe('ShopBuyer page (GROC-39)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads and renders products on mount', async () => {
    browseProducts.mockResolvedValue([
      { id: 'p1', name: 'Apples', price: 2.5 },
      { id: 'p2', name: 'Milk', price: 3.2 },
    ]);
    render(<ShopBuyer />);

    expect(await screen.findByText('Apples')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(browseProducts).toHaveBeenCalledWith({ search: '', category: '' });
  });

  test('re-fetches with the selected category', async () => {
    browseProducts.mockResolvedValue([{ id: 'p1', name: 'Apples', price: 2.5 }]);
    const user = userEvent.setup();
    render(<ShopBuyer />);

    await screen.findByText('Apples');
    await user.click(screen.getByRole('button', { name: 'Produce' }));

    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(browseProducts).toHaveBeenLastCalledWith({ search: '', category: 'produce' });
  });

  test('re-fetches with the search term after debouncing', async () => {
    browseProducts.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ShopBuyer />);

    await screen.findByText(/no items to show/i);
    await user.type(screen.getByLabelText(/search products/i), 'apple');

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(browseProducts).toHaveBeenLastCalledWith({ search: 'apple', category: '' });
  });

  test('shows an error message when the request fails', async () => {
    browseProducts.mockRejectedValue(new Error('network error'));
    render(<ShopBuyer />);

    expect(await screen.findByText(/could not load products/i)).toBeInTheDocument();
  });
});
