const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server-side mirror of the Signup (GROC-2) validation rules. Never trust
 * client-side validation alone — the API must re-check everything.
 */
function validateSignupPayload(body) {
  const errors = {};
  const { role, name, email, address, dob, password } = body || {};

  if (role !== 'buyer' && role !== 'seller') {
    errors.role = 'Role must be either "buyer" or "seller".';
  }
  if (!name || !String(name).trim()) {
    errors.name = 'Name is required.';
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.email = 'A valid email is required.';
  }
  if (!address || !String(address).trim()) {
    errors.address = 'Address is required.';
  }
  if (!dob || Number.isNaN(new Date(dob).getTime()) || new Date(dob) >= new Date()) {
    errors.dob = 'A valid date of birth in the past is required.';
  }
  if (!password || String(password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

/**
 * Server-side mirror of the Login (GROC-11) validation rules.
 */
function validateLoginPayload(body) {
  const errors = {};
  const { email, password } = body || {};

  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.email = 'A valid email is required.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

module.exports = { validateSignupPayload, validateLoginPayload, EMAIL_RE };
