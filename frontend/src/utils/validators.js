const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the Signup (GROC-2) form fields.
 * Returns a { field: message } map of errors; empty object means valid.
 */
export function validateSignupForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!form.email || !form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.address || !form.address.trim()) {
    errors.address = 'Address is required.';
  }

  if (!form.dob) {
    errors.dob = 'Date of birth is required.';
  } else {
    const dob = new Date(form.dob);
    const today = new Date();
    if (Number.isNaN(dob.getTime()) || dob >= today) {
      errors.dob = 'Enter a valid date of birth in the past.';
    }
  }

  if (!form.password || form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (form.role !== 'buyer' && form.role !== 'seller') {
    errors.role = 'Select whether you are a buyer or a seller.';
  }

  return errors;
}

/**
 * Validates the Login (GROC-11) form fields.
 */
export function validateLoginForm(form) {
  const errors = {};
  if (!form.email || !EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

/**
 * Validates the seller Add/Edit Item form (GROC-21).
 */
export function validateProductForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = 'Item name is required.';
  }

  const price = Number(form.price);
  if (form.price === '' || form.price === null || form.price === undefined || Number.isNaN(price) || price <= 0) {
    errors.price = 'Enter a price greater than $0.';
  }

  // Validate stock quantity field
  // mirrors the backend: only checked when a value is actually provided
  // empty/null/undefined will default to 0".
  if (form.stockQty !== '' && form.stockQty !== null && form.stockQty !== undefined) {
    const stock = Number(form.stockQty);
    if (Number.isNaN(stock) || stock < 0) {
      errors.stockQty = 'Enter a valid stock quantity (0 or more).';
    } else if (!Number.isInteger(stock)) {
      errors.stockQty = 'Stock quantity must be an integer.';
    }
  }
  return errors;
}
