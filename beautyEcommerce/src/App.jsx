import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import NotFoundPage from './components/NotFoundPage';
import CartPage from './components/cart/CartPage'
import React from 'react'
import ProductPage from './components/product/ProductPage';
import Profil from './components/profil/Profil';
import InstagramPage from './components/Instagram/InstagramPage';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import AdminDashboard from './components/pages/AdminDashboard';
import CheckOut from './components/Commande/CheckOut';
import Confirmation from './components/Commande/Confirmation';
import Paiement from './components/Paiement/Paiement';
import CommandeDetails from './components/Commande/CommandeDetails';
import GestionCommande from './components/AdminFunction/GestionCommande';
import AddProduct from './components/AddProduct';


const App = () => {
  return (
    <BrowserRouter>
     
      <Routes>
      <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
      <Route index element={<Home />} />
      <Route path='products/:slug' element = {<ProductPage/>}></Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/instagram" element={<InstagramPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/AddProduct" element={<AddProduct />} />

      <Route path="/checkout" element={<CheckOut />} />
      <Route path="/confirmation/:commande_id" element={<Confirmation />} />
      <Route path="/paiement/:commandeId/:montant" element={<Paiement />} />
      <Route path="/commande/:id" element={<CommandeDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

