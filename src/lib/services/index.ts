// Exportar todos os serviços em um local central
export { authService, userService } from './auth.service';
export { videoService } from './video.service';
export { trilhaService } from './trilha.service';
export { documentService } from './document.service';
export { embeddingService } from './embedding.service';

// Re-exportar tipos da API
export type {
  ApiResponse,
  User,
  Video,
  Trilha,
  Document,
  LoginRequest,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  CreateVideoRequest,
  UpdateVideoRequest,
  CreateTrilhaRequest,
  UpdateTrilhaRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  AddDocumentRequest,
  SearchDocumentRequest,
  EmbeddingDocumentResult,
  SearchResult
} from '../api';