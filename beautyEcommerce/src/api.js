import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"

    
})
export const mergeCart = (items) => {
  return api.post("/merge_cart/", { items });
};

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Intercepteur pour rafraîchir le token si nécessaire
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
              refresh: refreshToken,
            });
  
            localStorage.setItem("access_token", response.data.access);
            error.config.headers.Authorization = `Bearer ${response.data.access}`;
            return api(error.config);
          }
        } catch (err) {
          console.error("Session expirée. Veuillez vous reconnecter.");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login"; // Redirige vers la page de connexion
        }
      }
      return Promise.reject(error);
    }
    
  );

export default api