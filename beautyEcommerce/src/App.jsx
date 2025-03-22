import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import NotFoundPage from './components/NotFoundPage';

import React from 'react'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<NavBar />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

