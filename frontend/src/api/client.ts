import axios from "axios"

const api = axios.create({
   baseURL: "https://xpg4jlf7-8000.inc1.devtunnels.ms/",
  // baseURL: "http://192.168.29.106:8000/",
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers = config.headers || {}
    // DRF TokenAuthentication header
    config.headers["Authorization"] = `Token ${token}`
  } else if (config.headers && "Authorization" in config.headers) {
    // Leave explicit Authorization if caller set one
  }
  return config
})

export default api


