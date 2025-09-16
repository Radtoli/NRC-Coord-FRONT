// Exportar todos os serviços em um local central
export { authService, userService } from './auth.service';
export { videoService } from './video.service';
export { trilhaService } from './trilha.service';
export { documentService } from './document.service';

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
  UpdateDocumentRequest
} from '../api';