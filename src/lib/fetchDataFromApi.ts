import axios from "axios";

// ✅ Server & Client safe baseURL
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ✅ Axios instance (NO window / document here)
const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ Request interceptor (CLIENT-ONLY cookie access)
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((c) =>
        c.trim().startsWith("token=")
      );

      const token = tokenCookie
        ? decodeURIComponent(tokenCookie.split("=")[1])
        : null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ API helpers (clean & safe)
const fetchDataFromApi = {
  get: async (url: string, params = {}) => {
    return axiosInstance.get(url, { params });
  },

  post: async (url: string, data = {}) => {
    return axiosInstance.post(url, data);
  },
};

export default fetchDataFromApi;


export default fetchData;
