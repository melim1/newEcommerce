import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import NotFoundPage from './components/NotFoundPage';

import React from 'react'
import ProductPage from './components/product/ProductPage';


const App = () => {
  return (
    <BrowserRouter>
     
      <Routes>
      <Route index element={<NavBar />} />
      <Route path='products/:slug' element = {<ProductPage/>}></Route>

      <Route path="*" element={<NotFoundPage />} />
       
      </Routes>
    </BrowserRouter>
  )
}

export default App

