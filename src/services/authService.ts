import api from "./api";

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    cpf: string;
    password: string;
    confirmpassword: string;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    cpf: string;
    firstName: string;
}

export interface LoginResponse {
    code: string;
    message: string;
    user: UserData;
    token: string;
}

export interface RegisterResponse {
    code: string;
    message: string;
}

export const authService = {
    // Login user
    login: async (data: LoginData) => {
        try {
            const response = await api.post<LoginResponse>("/auth/login", data);
            return response.data;
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    },

    // Register user
    register: async (data: RegisterData) => {
        try {
            const response = await api.post<RegisterResponse>("/auth/register", data);
            return response.data;
        } catch (error) {
            console.error("Error registering:", error);
            throw error;
        }
    },
};

export default authService;
