import { api, ApiResponse, CreateVideoRequest, UpdateVideoRequest, Video } from '../api';

export const videoService = {
  // Listar todos os vídeos
  async listVideos(): Promise<ApiResponse<Video[]>> {
    return api.get<ApiResponse<Video[]>>('/videos');
  },

  // Buscar vídeo por ID
  async getVideoById(id: string): Promise<ApiResponse<Video>> {
    return api.get<ApiResponse<Video>>(`/videos/${id}`);
  },

  // Criar vídeo (apenas managers)
  async createVideo(videoData: CreateVideoRequest): Promise<ApiResponse<Video>> {
    return api.post<ApiResponse<Video>>('/videos', videoData);
  },

  // Atualizar vídeo (apenas managers)
  async updateVideo(id: string, videoData: UpdateVideoRequest): Promise<ApiResponse<Video>> {
    return api.put<ApiResponse<Video>>(`/videos/${id}`, videoData);
  },

  // Deletar vídeo (apenas managers)
  async deleteVideo(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`/videos/${id}`);
  },

  // Buscar vídeos por trilha
  async getVideosByTrilha(trilhaId: string): Promise<Video[]> {
    const response = await this.listVideos();
    if (response.success && response.data) {
      return response.data.filter(video => video.trilha === trilhaId);
    }
    return [];
  }
};