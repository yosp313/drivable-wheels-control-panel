import api from "../config";

// Define types for your data
enum Difficulty{
    EASY, MEDIUM, HARD
}
export interface Scenario{
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

  // Update existing item
  update: async (id: number, data: Partial<sessionData>) => {
    const response = await api.put<sessionData>(
      `/api/v1/admin-dashboard/sessions/name/${id}`,
      data,
    );
    return response.data;
  },


  // Delete item
  delete: async (id: number) => {
    try{
      await api.delete(`/api/v1/admin-dashboard/sessions/${id}`); 
    }catch(e){
      console.error(e)
    }
  },
};

export default sessionService;

