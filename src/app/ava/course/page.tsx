'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { avaService, Course } from '@/lib/services/ava.service';
import { BookOpen } from 'lucide-react';

export default function StudentCourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    avaService
      .listCourses()
      .then(setCourses)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar cursos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="mb-4 inline-block text-sm text-blue-200 hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Cursos disponíveis</h1>
          <p className="mt-2 text-sm text-blue-200">Visualização como aluno</p>
        </div>
      </div>

      {/* Course list */}
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-gray-400">
            <BookOpen className="h-12 w-12 mb-4" />
            <p className="text-sm">Nenhum curso disponível ainda.</p>
          </div>
        ) : (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/ava/course/${course.id}`}
              className="block rounded-xl border bg-white shadow-sm px-6 py-5 hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{course.title}</p>
                  {course.description && (
                    <p className="mt-1 text-sm text-gray-500 truncate">{course.description}</p>
                  )}
                  <span
                    className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${course.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : course.status === 'archived'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {course.status === 'published'
                      ? 'Publicado'
                      : course.status === 'archived'
                        ? 'Arquivado'
                        : 'Rascunho'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
