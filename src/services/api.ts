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

        // Log the request
        console.log(
            `📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
            {
                data: config.data,
            }
        );

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to log responses
api.interceptors.response.use(
    (response) => {
        console.log(
            `📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
                status: response.status,
                data: response.data,
            }
        );
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

export default api;
