'use client';

import { EmbeddingTest } from '@/components/EmbeddingTest';

export default function TestEmbeddingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Teste de Embedding</h1>
        <p className="text-gray-600 mt-2">
          Interface para testar o serviço de embedding e busca por similaridade vetorial.
        </p>
      </div>

      <EmbeddingTest />
    </div>
  );
}