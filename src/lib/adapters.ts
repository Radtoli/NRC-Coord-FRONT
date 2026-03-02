import { Video as ApiVideo, Trilha as ApiTrilha, Document as ApiDocument } from './services';

// Interfaces que mantêm compatibilidade com o código existente
export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  documents: Document[];
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'xlsx';
  url: string;
  size: string;
}

export interface Trilha {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

// Funções para converter dados da API para o formato esperado pelo frontend
export const convertApiVideoToVideo = (apiVideo: ApiVideo, documents: ApiDocument[] = []): Video => {
  return {
    id: apiVideo._id,
    title: apiVideo.title,
    description: apiVideo.description,
    youtubeId: apiVideo.youtubeId,
    duration: apiVideo.duration,
    documents: documents.map(convertApiDocumentToDocument)
  };
};

export const convertApiDocumentToDocument = (apiDocument: ApiDocument): Document => {
  return {
    id: apiDocument._id,
    title: apiDocument.title,
    type: apiDocument.type as 'pdf' | 'doc' | 'ppt' | 'xlsx',
    url: apiDocument.url,
    size: apiDocument.size
  };
};

export const convertApiTrilhaToTrilha = (apiTrilha: ApiTrilha, videos: Video[] = []): Trilha => {
  return {
    id: apiTrilha._id,
    title: apiTrilha.title,
    description: apiTrilha.description,
    videos: videos
  };
};

// Funções para converter do formato frontend para a API
export const convertVideoToApiVideo = (video: Partial<Video>, trilhaId: string): {
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  trilha: string;
  documents?: string[];
} => {
  return {
    title: video.title || '',
    description: video.description || '',
    youtubeId: video.youtubeId || '',
    duration: video.duration || '',
    trilha: trilhaId,
    documents: video.documents?.map(doc => doc.id) || []
  };
};

export const convertDocumentToApiDocument = (document: Partial<Document>): {
  title: string;
  type: string;
  url: string;
  size: string;
} => {
  return {
    title: document.title || '',
    type: document.type || 'pdf',
    url: document.url || '',
    size: document.size || ''
  };
};

export const convertTrilhaToApiTrilha = (trilha: Partial<Trilha>): {
  title: string;
  description: string;
  videos?: string[];
} => {
  return {
    title: trilha.title || '',
    description: trilha.description || '',
    videos: trilha.videos?.map(video => video.id) || []
  };
};