import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProductForm from './pages/seller/ProductForm';
import ShopSeller from './pages/seller/ShopSeller';
import ShopBuyer from './pages/buyer/ShopBuyer';
import Cart from './pages/buyer/Cart';

// Feature routes are added incrementally as each epic lands:
// Checkout (Epic 3), seller order queue (Epic 4), order tracking
// (Epic 5).

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<ShopBuyer />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/seller" element={<ShopSeller />} />
        <Route path="/seller/products/new" element={<ProductForm />} />
        <Route path="/seller/products/:id/edit" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
