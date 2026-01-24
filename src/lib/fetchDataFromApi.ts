import axios from "axios";

/**
 * NOTE:
 * - document / window sirf browser me available hote hain
 * - isliye token read karna client-side me hi hoga
 */

const isBrowser = typeof window !== "undefined";

const baseURL = isBrowser
  ? "/api"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor (ONLY in browser)
if (isBrowser) {
  axiosInstance.interceptors.request.use(
    (config) => {
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

      return config;
    },
    (error) => Promise.reject(error)
  );
}

const fetchDataFromApi = {
  get: async (url: string, params = {}) => {
    return axiosInstance.get(url, { params });
  },

  post: async (url: string, data = {}) => {
    return axiosInstance.post(url, data);
  },
};

export default fetchDataFromApi;
