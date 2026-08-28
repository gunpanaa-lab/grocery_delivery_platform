import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mb-6">
        <span className="text-4xl" role="img" aria-label="cart">
          🛒
        </span>
      </div>
      <h1 className="text-3xl font-semibold mb-2">Welcome to grocer.</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Fresh groceries from your local store, delivered to your door.
      </p>
      <Link
        to="/shop"
        className="w-full max-w-sm bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg mb-4"
      >
        Start shopping
      </Link>
      <p className="text-sm text-gray-400 mb-4">Have an account?</p>
      <Link
        to="/login"
        className="w-full max-w-sm border border-gray-300 py-3 rounded-lg mb-3 font-medium"
      >
        Log in
      </Link>
      <Link to="/signup" className="w-full max-w-sm border border-gray-300 py-3 rounded-lg font-medium">
        Sign up
      </Link>
    </div>
  );
}
