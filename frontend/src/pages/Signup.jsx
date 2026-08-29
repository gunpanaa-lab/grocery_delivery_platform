import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSignupForm } from '../utils/validators';
import { signup } from '../services/authService';

const initialForm = {
  role: 'buyer',
  name: '',
  email: '',
  address: '',
  dob: '',
  password: '',
  confirmPassword: '',
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
  };

  const handleRoleChange = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationErrors = validateSignupForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      await signup(form);
      setSuccess(true);
      // Sub Task 1.6 — give the success banner a moment to render, then
      // send the new user to the login page to sign in with their account.
      setTimeout(() => {
        navigate('/login', { state: { justSignedUp: true } });
      }, 1200);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      }
      setFormError(data?.message || 'Something went wrong creating your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-center mb-6">Create your account</h1>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
          {formError}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 text-green-700 text-sm px-4 py-3">
          Account created! You can now log in.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label className="block text-sm font-medium mb-2">I am a</label>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleRoleChange('buyer')}
            className={`flex-1 py-2 rounded-lg border ${
              form.role === 'buyer' ? 'border-brand-600 text-brand-700 bg-brand-50' : 'border-gray-300'
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('seller')}
            className={`flex-1 py-2 rounded-lg border ${
              form.role === 'seller' ? 'border-brand-600 text-brand-700 bg-brand-50' : 'border-gray-300'
            }`}
          >
            Seller
          </button>
        </div>

        <Field label="Full name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <Field
          label="Email *"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Field
          label={form.role === 'seller' ? 'Store address *' : 'Delivery address *'}
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Ex. 123 St 4066"
          error={errors.address}
        />
        <Field
          label="Date of birth *"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          error={errors.dob}
        />
        <Field
          label="Password *"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Minimum 8 characters"
          error={errors.password}
        />
        <Field
          label="Confirm password *"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg mt-2"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder, error }) {
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
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full border rounded-lg px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
