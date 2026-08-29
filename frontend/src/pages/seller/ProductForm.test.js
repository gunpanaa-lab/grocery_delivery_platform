import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductForm from './ProductForm';
import { createProduct, updateProduct } from '../../services/productService';

// Sub Task 3.7 — frontend unit tests for the seller item form (GROC-21).
jest.mock('../../services/productService', () => ({
  ...jest.requireActual('../../services/productService'),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderNew() {
  return render(
    <MemoryRouter initialEntries={['/seller/products/new']}>
      <Routes>
        <Route path="/seller/products/new" element={<ProductForm />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEdit(product) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: `/seller/products/${product.id}/edit`, state: { product } }]}
    >
      <Routes>
        <Route path="/seller/products/:id/edit" element={<ProductForm />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductForm (GROC-21)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows validation errors and does not call the API for an empty form', async () => {
    const user = userEvent.setup();
    renderNew();

    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(await screen.findByText(/item name is required/i)).toBeInTheDocument();
    expect(createProduct).not.toHaveBeenCalled();
  });

  test('creates a new product and redirects to /seller on success', async () => {
    createProduct.mockResolvedValueOnce({ id: 'p1', name: 'Apples', price: 2.5 });
    const user = userEvent.setup();
    renderNew();

    await user.type(screen.getByLabelText(/item name/i), 'Apples');
    await user.type(screen.getByLabelText(/price/i), '2.5');
    await user.click(screen.getByRole('button', { name: /add item/i }));

    await screen.findByRole('button', { name: /add item/i });
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Apples', price: 2.5 })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/seller');
  });

  test('pre-fills the form and calls updateProduct when editing', async () => {
    const product = {
      id: 'p1',
      name: 'Apples',
      description: 'Crisp red apples',
      price: 2.5,
      category: 'produce',
      imageUrl: '',
    };
    updateProduct.mockResolvedValueOnce(product);
    const user = userEvent.setup();
    renderEdit(product);

    expect(screen.getByLabelText(/item name/i)).toHaveValue('Apples');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/price/i));
    await user.type(screen.getByLabelText(/price/i), '3');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await screen.findByRole('button', { name: /save changes/i });
    expect(updateProduct).toHaveBeenCalledWith('p1', expect.objectContaining({ price: 3 }));
    expect(mockNavigate).toHaveBeenCalledWith('/seller');
  });
});
