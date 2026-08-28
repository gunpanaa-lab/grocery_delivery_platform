import api from '../axiosConfig';

export async function signup({ role, name, email, address, dob, password }) {
  const { data } = await api.post('/auth/register', {
    role,
    name,
    email,
    address,
    dob,
    password,
  });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}
