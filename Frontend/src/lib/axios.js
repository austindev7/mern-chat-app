import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",  // Make sure this matches your backend
    withCredentials: true, // Ensures cookies (JWT) are sent
});

export default axiosInstance;
