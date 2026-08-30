import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getStoredUser, clearStoredUser } from '../utils/session';
import CartIcon from './icons/CartIcon';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isSeller = user?.role === 'seller';

  const handleLogout = () => {
    clearStoredUser();
    navigate('/');
  };

  const linkClass = ({ isActive }) => (isActive ? 'font-semibold text-gray-900' : 'text-gray-500');

  return (
    <header className="border-b border-gray-200">
      <nav className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-brand-700">
            grocer.
          </Link>
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to={isSeller ? '/seller' : '/shop'} className={linkClass}>
              Shop
            </NavLink>
            <NavLink to={isSeller ? '/seller/orders' : '/cart'} className={linkClass}>
              Order
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isSeller && (
            <Link to="/cart" aria-label="Cart" className="text-gray-700">
              <CartIcon className="w-6 h-6" />
            </Link>
          )}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm border border-brand-600 text-brand-700 font-medium py-1.5 px-4 rounded-full"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm border border-brand-600 text-brand-700 font-medium py-1.5 px-4 rounded-full"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
