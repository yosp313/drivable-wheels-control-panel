import api from "../config";
import { sessionData } from "./SessionsService";
import { userData } from "./UserService";

// Define types for your data
enum transmission_type{
    MANUAL, AUTOMATIC
}

export interface registrationData {
id: number;
feedback: string;
completed: boolean;
paid: boolean;
score: number;
transmissionType: transmission_type
session: sessionData;
user: userData;
}

// Example service class/object
const registrationService = {
  // Get all items
  getAll: async () => {
    const response = await api.get<registrationData[]>(
      "/api/v1/admin-dashboard/registrations",
      {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      },
    );
    return response.data;
  },

  // Update existing item
  update: async (id: number, data: Partial<registrationData>) => {
    const response = await api.put<registrationData>(
      `/api/v1/admin-dashboard/registrations/name/${id}`,
      data,
    );
    return response.data;
  },


  // Delete item
  delete: async (id: number) => {
    await api.delete(`/api/v1/admin-dashboard/registrations/${id}`);
  },
};

export default registrationService;

