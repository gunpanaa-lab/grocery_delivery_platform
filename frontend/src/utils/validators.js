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
