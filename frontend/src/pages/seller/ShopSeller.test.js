import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ShopSeller from './ShopSeller';
import { listMyProducts, deleteProduct } from '../../services/productService';

// Sub Task 3.7 — frontend unit tests for the Shop-Seller listing page.
jest.mock('../../services/productService', () => ({
  ...jest.requireActual('../../services/productService'),
  listMyProducts: jest.fn(),
  deleteProduct: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderShopSeller() {
  return render(
    <MemoryRouter>
      <ShopSeller />
    </MemoryRouter>
  );
}

describe('ShopSeller page (GROC-21)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows an empty state when the seller has no items', async () => {
    listMyProducts.mockResolvedValueOnce([]);
    renderShopSeller();

    expect(await screen.findByText(/haven't listed any items yet/i)).toBeInTheDocument();
  });

  test('renders the seller\'s products once loaded', async () => {
    listMyProducts.mockResolvedValueOnce([
      { id: 'p1', name: 'Apples', price: 2.5, inStock: true },
      { id: 'p2', name: 'Milk', price: 3.2, inStock: false },
    ]);
    renderShopSeller();

    expect(await screen.findByText('Apples')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  test('deletes a product when Delete is clicked', async () => {
    listMyProducts.mockResolvedValueOnce([{ id: 'p1', name: 'Apples', price: 2.5, inStock: true }]);
    deleteProduct.mockResolvedValueOnce({ message: 'Product deleted' });
    const user = userEvent.setup();
    renderShopSeller();

    await screen.findByText('Apples');
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(deleteProduct).toHaveBeenCalledWith('p1');
    await screen.findByText(/haven't listed any items yet/i);
  });
});
