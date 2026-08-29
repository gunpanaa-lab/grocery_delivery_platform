import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listMyProducts, deleteProduct } from '../../services/productService';

// Sub Task 3.6 — seller "Shop-Seller" screen: lists everything this
// seller has listed, with Add / Edit / Delete actions.
export default function ShopSeller() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMyProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your items. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (product) => {
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      setError('Could not delete this item. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My shop</h1>
        <Link
          to="/seller/products/new"
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          + Add item
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading your items…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t listed any items yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product.id} className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  ${Number(product.price).toFixed(2)} · {product.inStock ? 'In stock' : 'Out of stock'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {}}
                  className={`text-sm rounded-lg px-3 py-1.5 border ${
                    product.inStock ? 'border-gray-300' : 'border-amber-300 text-amber-700 bg-amber-50'
                  }`}
                >
                  {product.inStock ? 'Mark out of stock' : 'Mark in stock'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/seller/products/${product.id}/edit`, { state: { product } })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="text-sm border border-red-300 text-red-600 rounded-lg px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
