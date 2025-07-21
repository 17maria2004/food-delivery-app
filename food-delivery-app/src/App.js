import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Header from './components/Header'; 
import Promotions from './components/Promotions';
import Menu from './components/Menu'; 
import Burger2 from './components/Burger2'; 
import BookTable from './components/BookTable';
import TestimonialSlider from './components/TestimonialSlider';
import Footer from './components/Footer';
import CartPage from "./components/CartPage"; 
import './App.css';

function App() {

  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <Header />
                <Promotions />
                <Menu />
                <Burger2 />
                <BookTable />
                <TestimonialSlider/>
                <Footer /> 
              </div>
            }
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<Burger2 />} />
          <Route path="/add-address" element={<BookTable />} />
          <Route path="/testimonial" element={<TestimonialSlider />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
