'use client';

import { use } from 'react';
import { PageBuilder } from '@/components/ava/PageBuilder';
import Link from 'next/link';

interface Props {
  params: Promise<{ pageId: string }>;
}

export default function CoordinatorPageEditor({ params }: Props) {
  const { pageId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
            ← Painel admin
          </Link>
          <h1 className="text-sm font-semibold text-gray-700">Editor de Página AVA</h1>
          <span />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <PageBuilder pageId={pageId} />
      </div>
    </div>
  );
}
