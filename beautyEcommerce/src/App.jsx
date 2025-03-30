import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import NotFoundPage from './components/NotFoundPage';
import CartPage from './components/cart/CartPage'
import React from 'react'
import ProductPage from './components/product/ProductPage';
import Profil from './components/profil/Profil';
import InstagramPage from './components/Instagram/InstagramPage';


const App = () => {
  return (
    <BrowserRouter>
     
      <Routes>
      <Route index element={<NavBar />} />
      <Route path='products/:slug' element = {<ProductPage/>}></Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/instagram" element={<InstagramPage />} />

       
      </Routes>
    </BrowserRouter>
  )
}

export default App

