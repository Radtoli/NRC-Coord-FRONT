import { useState, useCallback } from 'react';
import { embeddingService, SearchResult } from '@/lib/services';

interface UseEmbeddingReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  searchResults: SearchResult[];

  // Ações
  addDocument: (text: string, provaId: string, tipoProva: string, numeroQuestao: number) => Promise<{ success: boolean; id?: string }>;
  searchDocuments: (query: string, provaId: string, tipoProva: string, numeroQuestao: number, limit?: number) => Promise<SearchResult[]>;
  clearResults: () => void;
  clearError: () => void;
}

export const useEmbedding = (): UseEmbeddingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addDocument = useCallback(async (
    text: string,
    provaId: string,
    tipoProva: string,
    numeroQuestao: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await embeddingService.addDocumentToVector(text, provaId, tipoProva, numeroQuestao);

      if (!result.success) {
        setError(result.message || 'Erro ao adicionar documento');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(async (
    query: string,
    provaId: string,
    tipoProva: string,
    numeroQuestao: number,
    limit = 10
  ) => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const results = await embeddingService.searchSimilarDocuments(query, provaId, tipoProva, numeroQuestao, limit);
      setSearchResults(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na busca';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    searchResults,
    addDocument,
    searchDocuments,
    clearResults,
    clearError,
  };
};