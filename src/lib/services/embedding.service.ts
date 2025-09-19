import {
  api,
  ApiResponse,
  AddDocumentRequest,
  SearchDocumentRequest,
  EmbeddingDocumentResult,
  SearchResult
} from '../api';

export const embeddingService = {
  // Adicionar documento ao banco de vetores
  async addDocument(request: AddDocumentRequest): Promise<ApiResponse<EmbeddingDocumentResult>> {
    try {
      const response = await api.post<ApiResponse<EmbeddingDocumentResult>>('/embedding/add', request);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar documentos similares
  async searchDocuments(request: SearchDocumentRequest): Promise<ApiResponse<SearchResult[]>> {
    try {
      const response = await api.post<ApiResponse<SearchResult[]>>('/embedding/search', request);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar documentos similares com tratamento de erro mais amigável
  async searchSimilarDocuments(
    query: string,
    provaId: string,
    tipoProva: string,
    numeroQuestao: number,
    limit = 10
  ): Promise<SearchResult[]> {
    try {
      const response = await this.searchDocuments({
        query,
        provaId,
        tipoProva,
        numeroQuestao,
        limit
      });

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar documentos similares:', error);
      return [];
    }
  },

  // Adicionar documento com tratamento simplificado
  async addDocumentToVector(
    text: string,
    provaId: string,
    tipoProva: string,
    numeroQuestao: number
  ): Promise<{ success: boolean; id?: string; message?: string }> {
    try {
      const response = await this.addDocument({
        text,
        provaId,
        tipoProva,
        numeroQuestao
      });

      if (response.success && response.data) {
        return {
          success: true,
          id: response.data.id,
          message: response.message
        };
      }

      return {
        success: false,
        message: response.message || 'Erro ao adicionar documento'
      };
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
};