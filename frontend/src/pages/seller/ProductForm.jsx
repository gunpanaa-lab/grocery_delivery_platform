import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../services/productService';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: CATEGORIES[0],
  imageUrl: '',
};

// Sub Task 3.2 — seller "add/edit item" form component, matching the
// Figma Edit Item-Seller screen. Reused for both creating a new
// product and editing an existing one (id present via the route).
export default function ProductForm({ initialProduct }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(() => (initialProduct ? toFormValues(initialProduct) : emptyForm));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-md mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-center mb-6">
        {isEditing ? 'Edit item' : 'Add a new item'}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Item name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <Field
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
        <Field
          label="Price ($) *"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
        />
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Image URL"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          error={errors.imageUrl}
        />

        <button
          type="submit"
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg mt-2"
        >
          {isEditing ? 'Save changes' : 'Add item'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/seller')}
          className="w-full border border-gray-300 py-3 rounded-lg mt-3 font-medium"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

function toFormValues(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    price: product.price ?? '',
    category: product.category || CATEGORIES[0],
    imageUrl: product.imageUrl || '',
  };
}

function Field({ label, name, type = 'text', value, onChange, error }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`w-full border rounded-lg px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
