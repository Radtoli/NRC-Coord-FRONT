import React, { useState } from 'react';
import { embeddingService, SearchResult } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface EmbeddingTestProps {
  className?: string;
}

export const EmbeddingTest: React.FC<EmbeddingTestProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para adicionar documento
  const [addForm, setAddForm] = useState({
    text: '',
    provaId: 'PROVA_002',
    tipoProva: 'Capela',
    numeroQuestao: 1
  });

  // Estados para buscar documentos
  const [searchForm, setSearchForm] = useState({
    query: '',
    provaId: 'PROVA_002',
    tipoProva: 'Capela',
    numeroQuestao: 1,
    limit: 5
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Adicionar documento
  const handleAddDocument = async () => {
    if (!addForm.text.trim()) {
      setMessage({ type: 'error', text: 'Texto é obrigatório' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await embeddingService.addDocumentToVector(
        addForm.text,
        addForm.provaId,
        addForm.tipoProva,
        addForm.numeroQuestao
      );

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Documento adicionado com sucesso! ID: ${result.id}`
        });
        setAddForm({ ...addForm, text: '' });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Erro ao adicionar documento'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar documentos
  const handleSearchDocuments = async () => {
    if (!searchForm.query.trim()) {
      setMessage({ type: 'error', text: 'Query é obrigatória' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setSearchResults([]);

    try {
      const results = await embeddingService.searchSimilarDocuments(
        searchForm.query,
        searchForm.provaId,
        searchForm.tipoProva,
        searchForm.numeroQuestao,
        searchForm.limit
      );

      setSearchResults(results);
      setMessage({
        type: 'success',
        text: `Encontrados ${results.length} documento(s) similar(es)`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro na busca'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adicionar Documento */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Documento</CardTitle>
            <CardDescription>
              Adiciona um documento ao banco de vetores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Prova ID</label>
                <Input
                  value={addForm.provaId}
                  onChange={(e) => setAddForm({ ...addForm, provaId: e.target.value })}
                  placeholder="PROVA_001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo Prova</label>
                <Input
                  value={addForm.tipoProva}
                  onChange={(e) => setAddForm({ ...addForm, tipoProva: e.target.value })}
                  placeholder="Capela"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Número da Questão</label>
              <Input
                type="number"
                value={addForm.numeroQuestao}
                onChange={(e) => setAddForm({ ...addForm, numeroQuestao: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Texto do Documento</label>
              <Textarea
                value={addForm.text}
                onChange={(e) => setAddForm({ ...addForm, text: e.target.value })}
                placeholder="Digite o conteúdo do documento..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleAddDocument}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Documento'}
            </Button>
          </CardContent>
        </Card>

        {/* Buscar Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Documentos</CardTitle>
            <CardDescription>
              Busca documentos similares no banco de vetores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Prova ID</label>
                <Input
                  value={searchForm.provaId}
                  onChange={(e) => setSearchForm({ ...searchForm, provaId: e.target.value })}
                  placeholder="PROVA_001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo Prova</label>
                <Input
                  value={searchForm.tipoProva}
                  onChange={(e) => setSearchForm({ ...searchForm, tipoProva: e.target.value })}
                  placeholder="Capela"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Número da Questão</label>
                <Input
                  type="number"
                  value={searchForm.numeroQuestao}
                  onChange={(e) => setSearchForm({ ...searchForm, numeroQuestao: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Limite</label>
                <Input
                  type="number"
                  value={searchForm.limit}
                  onChange={(e) => setSearchForm({ ...searchForm, limit: parseInt(e.target.value) || 5 })}
                  max={10}
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Query de Busca</label>
              <Textarea
                value={searchForm.query}
                onChange={(e) => setSearchForm({ ...searchForm, query: e.target.value })}
                placeholder="Digite sua consulta..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleSearchDocuments}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Buscando...' : 'Buscar Documentos'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mensagens */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultados da Busca */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>
              Documentos encontrados ordenados por similaridade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Badge variant="secondary">
                      Score: {(result.score * 100).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">ID:</span> {result.id}
                    </div>
                    <div>
                      <span className="font-medium">Prova:</span> {result.payload.provaId}
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span> {result.payload.tipoProva}
                    </div>
                    <div>
                      <span className="font-medium">Questão:</span> {result.payload.numeroQuestao}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">Texto:</span>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                      {result.payload.text}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500">
                    Criado em: {new Date(result.payload.createdAt).toLocaleString()}
                    {result.payload.originalId && (
                      <span className="ml-4">ID Original: {result.payload.originalId}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};