import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProductForm from './pages/seller/ProductForm';

// Feature routes are added incrementally as each epic lands:
// Shop-Buyer/Cart/Checkout (Epic 3), Seller order queue (Epic 4),
// Order tracking (Epic 5).

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller/products/new" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
