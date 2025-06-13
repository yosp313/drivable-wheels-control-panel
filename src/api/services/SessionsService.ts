import api from "../config";

// Define types for your data
export enum Difficulty {
    EASY, MEDIUM, HARD
}

export interface Scenario {
    scenarioID: string;
    name: string;
    environmentType: string;
    difficulty: Difficulty;
}

export interface sessionData {
    id: number;
    scenario: Scenario;
    location: string;
    date: Date;
    description?: string;
    duration: number;
}

// Type for creating new sessions (without id)
export interface CreateSessionData {
    scenarioID: string;
    location: string;
    date: string; // ISO string format for form handling
}

// Example service class/object
const sessionService = {
  // Get all items
  getAll: async () => {
    const response = await api.get<sessionData[]>(
      "/api/v1/admin-dashboard/sessions",
      {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      },
    );
    return response.data;
  },

  // Create new session
  create: async (data: CreateSessionData): Promise<sessionData> => {
    console.log('Creating session with data:', data);
    console.log('Token:', localStorage.getItem('token'));
    
    const response = await api.post<sessionData>(
      "/api/v1/admin-dashboard/sessions",
      data,
      {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    console.log('Create session response:', response.data);
    return response.data;
  },

  // Update existing item
  update: async (id: number, data: Partial<CreateSessionData>) => {
    const response = await api.put<sessionData>(
      `/api/v1/admin-dashboard/sessions/${id}`,
      data,
      {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  },

  // Delete item
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin-dashboard/sessions/${id}`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
    });
  },
};

export default sessionService;

