import { api, ApiResponse, CreateTrilhaRequest, UpdateTrilhaRequest, Trilha } from '../api';

export const trilhaService = {
  async listTrilhas(): Promise<ApiResponse<Trilha[]>> {
    return api.get<ApiResponse<Trilha[]>>('/trilhas');
  },

  async getTrilhaById(id: string): Promise<ApiResponse<Trilha>> {
    return api.get<ApiResponse<Trilha>>(`/trilhas/${id}`);
  },

  async createTrilha(trilhaData: CreateTrilhaRequest): Promise<ApiResponse<Trilha>> {
    return api.post<ApiResponse<Trilha>>('/trilhas', trilhaData);
  },

  async updateTrilha(id: string, trilhaData: UpdateTrilhaRequest): Promise<ApiResponse<Trilha>> {
    return api.put<ApiResponse<Trilha>>(`/trilhas/${id}`, trilhaData);
  },

  async deleteTrilha(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`/trilhas/${id}`);
  }
};