import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create an instance of axios with default configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add the token to every request
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting token:", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
