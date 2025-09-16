import { api, ApiResponse, CreateTrilhaRequest, UpdateTrilhaRequest, Trilha } from '../api';

export const trilhaService = {
  // Listar todas as trilhas
  async listTrilhas(): Promise<ApiResponse<Trilha[]>> {
    return api.get<ApiResponse<Trilha[]>>('/trilhas');
  },

  // Buscar trilha por ID
  async getTrilhaById(id: string): Promise<ApiResponse<Trilha>> {
    return api.get<ApiResponse<Trilha>>(`/trilhas/${id}`);
  },

  // Criar trilha (apenas managers)
  async createTrilha(trilhaData: CreateTrilhaRequest): Promise<ApiResponse<Trilha>> {
    return api.post<ApiResponse<Trilha>>('/trilhas', trilhaData);
  },

  // Atualizar trilha (apenas managers)
  async updateTrilha(id: string, trilhaData: UpdateTrilhaRequest): Promise<ApiResponse<Trilha>> {
    return api.put<ApiResponse<Trilha>>(`/trilhas/${id}`, trilhaData);
  },

  // Deletar trilha (apenas managers)
  async deleteTrilha(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`/trilhas/${id}`);
  }
};