import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Feature routes are added incrementally as each epic lands:
// Signup/Login (Epic 1), Shop/ProductForm (Epic 2), Cart/Checkout (Epic 3),
// Seller order queue (Epic 4), Order tracking (Epic 5).

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
