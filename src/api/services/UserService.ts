import api from "../config";

// Define types for your data
export interface userData {
  id: number;
  email: string;
  Password: string;
  firstName: string;
  lastName: string;
  transmission: string; // Add other fields as needed
}

// Example service class/object
const userService = {
  // Get all items
  getAll: async () => {
    const response = await api.get<userData[]>(
      "/api/v1/admin-dashboard/users",
      {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      },
    );
    return response.data;
  },

  // Create new user
  create: async (userData: Omit<userData, 'id'>) => {
    const response = await api.post<userData>(
      "/api/v1/admin-dashboard/users",
      userData,
      {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  },

  // Get single item by ID
  getById: async (id: number) => {
    const response = await api.get<userData>(
      `/api/v1/admin-dashboard/users/${id}`,
    );
    return response.data;
  },

  // Update existing item
  update: async (id: number, data: Partial<userData>) => {
    const response = await api.put<userData>(
      `/api/v1/admin-dashboard/users/name/${id}`,
      data,
    );
    return response.data;
  },

  // Delete item
  delete: async (id: number) => {
    await api.delete(`/api/v1/admin-dashboard/users/${id}`);
  },
};

export default userService;

