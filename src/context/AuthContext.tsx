import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService, { LoginData, RegisterData, UserData } from "../services/authService";

interface AuthContextData {
    isAuthenticated: boolean;
    user: UserData | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginData) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is logged in when app starts
    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");
                const storedUser = await AsyncStorage.getItem("user");

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Error loading stored auth:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    const login = async (credentials: LoginData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);

            // Store auth data
            await AsyncStorage.setItem("token", response.token);
            await AsyncStorage.setItem("user", JSON.stringify(response.user));

            // Update state
            setToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (err: any) {
            // Handle error response from API
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Failed to login");
            } else {
                setError("Network error. Please try again.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.register(userData);
            // Registration successful, but we don't automatically log in
        } catch (err: any) {
            // Handle error response from API
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Failed to register");
            } else {
                setError("Network error. Please try again.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            // Clear stored auth data
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");

            // Update state
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token,
                isLoading,
                error,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
