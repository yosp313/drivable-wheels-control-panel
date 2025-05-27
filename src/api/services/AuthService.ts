import Login from '@/pages/Login';
import api from '../config';

// Define types for your data
interface authData {
    token: string;
    expiresIn: number;
}

// Example service class/object
const authService = {
    // Get all items
    Login: async (email: string, password:string) => {
        const response = await api.post<authData>('/api/v1/auth/login', {email,password});
        const data = response.data;

        localStorage.setItem("token", data.token);
    },

 
};

export default authService; 