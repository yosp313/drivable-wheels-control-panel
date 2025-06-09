import api from '../config';

// Define types for your data
interface authData {
    token: string;
    expiresIn: number;
    user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
}

interface LoginResponse {
    token: string;
    expiresIn: number;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
}

// Example service class/object
const authService = {
    // Login method
    Login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<authData>('/api/v1/auth/login', { email, password });
        const data = response.data;

        // Store token
        localStorage.setItem("token", data.token);
        
        // Store user data if available
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Return user data for context
        return {
            token: data.token,
            expiresIn: data.expiresIn,
            user: data.user || {
                id: 0,
                email: email,
                firstName: "User",
                lastName: ""
            }
        };
    },

    // Logout method
    logout: async () => {
        try {
            // Call logout endpoint if available
            await api.post('/api/v1/auth/logout');
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },

    // Get current user profile
    getCurrentUser: async () => {
        const response = await api.get('/api/v1/auth/me');
        return response.data;
    },

    // Refresh token if your API supports it
    refreshToken: async () => {
        const response = await api.post('/api/v1/auth/refresh');
        const data = response.data;
        localStorage.setItem("token", data.token);
        return data;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem("token");
        return !!token;
    }
};

export default authService;