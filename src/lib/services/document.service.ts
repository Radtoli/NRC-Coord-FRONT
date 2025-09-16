import { api, ApiResponse, CreateDocumentRequest, UpdateDocumentRequest, Document } from '../api';

export const documentService = {
  // Listar todos os documentos
  async listDocuments(): Promise<ApiResponse<Document[]>> {
    return api.get<ApiResponse<Document[]>>('/documents');
  },

  // Buscar documento por ID
  async getDocumentById(id: string): Promise<ApiResponse<Document>> {
    return api.get<ApiResponse<Document>>(`/documents/${id}`);
  },

  // Criar documento (apenas managers)
  async createDocument(documentData: CreateDocumentRequest): Promise<ApiResponse<Document>> {
    return api.post<ApiResponse<Document>>('/documents', documentData);
  },

  // Atualizar documento (apenas managers)
  async updateDocument(id: string, documentData: UpdateDocumentRequest): Promise<ApiResponse<Document>> {
    return api.put<ApiResponse<Document>>(`/documents/${id}`, documentData);
  },

  // Deletar documento (apenas managers)
  async deleteDocument(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`/documents/${id}`);
  },

  // Buscar documentos por IDs
  async getDocumentsByIds(ids: string[]): Promise<Document[]> {
    if (ids.length === 0) return [];

    try {
      const promises = ids.map(id => this.getDocumentById(id));
      const responses = await Promise.all(promises);

      return responses
        .filter(response => response.success && response.data)
        .map(response => response.data!);
    } catch (error) {
      console.error('Error fetching documents by IDs:', error);
      return [];
    }
  }
};