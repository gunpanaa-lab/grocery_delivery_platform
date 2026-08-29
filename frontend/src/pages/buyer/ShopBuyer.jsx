import { useEffect, useState } from 'react';

// Sub Task 5.1 — Shop-Buyer product grid component. Category filter
// (5.2), search (5.3), and the live API connection (5.4) are added
// incrementally on top of this static grid/list structure.
export default function ShopBuyer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Shop groceries</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No items to show yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="w-full aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center text-3xl">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
        ) : (
          <span role="img" aria-label="grocery item">
            🛒
          </span>
        )}
      </div>
      <p className="font-medium">{product.name}</p>
      <p className="text-sm text-gray-500">${Number(product.price).toFixed(2)}</p>
    </div>
  );
}
