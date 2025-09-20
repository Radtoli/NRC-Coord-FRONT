import React, { useState } from 'react';
import { useEmbedding } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SimpleEmbeddingExample: React.FC = () => {
  const { isLoading, error, searchResults, addDocument, searchDocuments, clearError } = useEmbedding();

  const [text, setText] = useState('');
  const [query, setQuery] = useState('');

  const handleAddDocument = async () => {
    const result = await addDocument(text, 'PROVA_001', 'Exemplo', 1);
    if (result.success) {
      setText('');
      alert(`Documento adicionado com ID: ${result.id}`);
    }
  };

  const handleSearch = async () => {
    await searchDocuments(query, 'PROVA_001', 'Exemplo', 1, 5);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo Simples de Embedding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adicionar Documento */}
          <div>
            <label className="block text-sm font-medium mb-2">Adicionar Documento</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o texto do documento..."
              rows={3}
            />
            <Button
              onClick={handleAddDocument}
              disabled={isLoading || !text.trim()}
              className="mt-2"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>

          {/* Buscar Documentos */}
          <div>
            <label className="block text-sm font-medium mb-2">Buscar Documentos</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite sua consulta..."
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="mt-2"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                Fechar
              </Button>
            </div>
          )}

          {/* Resultados */}
          {searchResults.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Resultados ({searchResults.length})</h3>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div key={result.id} className="bg-gray-50 p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">#{index + 1} - ID: {result.id}</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {(result.score * 100).toFixed(1)}% similar
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};