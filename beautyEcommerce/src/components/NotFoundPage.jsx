import React from 'react'
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <p className="text-xl text-gray-600 mb-6">Page non trouvée</p>
    <Link
      to="/"
      className="btn btn-light btn-lg rounded-pill px-4 py-2"
    >
      Retour à l'accueil
    </Link>
  </div>
  )
}

export default NotFoundPage
