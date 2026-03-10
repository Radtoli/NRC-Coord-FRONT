

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { Trilha, getTrilhas } from "@/config/trilhas";
import { useAuthContext } from "@/lib/context";
import { BookOpen, AlertCircle, RefreshCw, Search, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { avaService, Course } from "@/lib/services/ava.service";

export default function DashboardPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingTrilhas, setIsLoadingTrilhas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !currentUser) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingTrilhas(true);
        setError(null);
        const [trilhasData, coursesData] = await Promise.all([
          getTrilhas(),
          avaService.listCourses().catch(() => [] as Course[]),
        ]);
        setTrilhas(trilhasData);
        setCourses(coursesData);
      } catch {
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoadingTrilhas(false);
      }
    };

    loadData();
  }, [router, isAuthenticated, currentUser, authLoading]);

  const handleRefreshTrilhas = async () => {
    try {
      setIsLoadingTrilhas(true);
      setError(null);
      const [trilhasData, coursesData] = await Promise.all([
        getTrilhas(),
        avaService.listCourses().catch(() => [] as Course[]),
      ]);
      setTrilhas(trilhasData);
      setCourses(coursesData);
    } catch {
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoadingTrilhas(false);
    }
  };

  if (authLoading || isLoadingTrilhas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {authLoading ? 'Carregando autenticação...' : 'Carregando trilhas...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefreshTrilhas}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const linkedCourses = courses.filter(c => trilhas.some(t => t.courseId === c.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        showBackToDashboard={false}
        showRefresh={true}
        onRefresh={handleRefreshTrilhas}
        isRefreshing={isLoadingTrilhas}
      >
        <Badge variant="outline">
          {trilhas.length} trilha{trilhas.length !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline">
          <GraduationCap className="w-3 h-3 mr-1" />
          {linkedCourses.length} curso{linkedCourses.length !== 1 ? 's' : ''}
        </Badge>
      </AppHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Bem-vindo, {currentUser?.name}!
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore os treinamentos e possibilidades de se aprofundar e melhorar sua trajetória como corretor do NRC.
            </p>
            <div className="flex justify-center gap-4 md:hidden">
              <Badge variant="outline">
                {trilhas.length} trilha{trilhas.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline">
                <GraduationCap className="w-3 h-3 mr-1" />
                {linkedCourses.length} curso{linkedCourses.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Ações Rápidas — apenas para admins */}
          {currentUser?.role === 'manager' && (
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Ferramentas</h3>
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/plagio')}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Search className="w-5 h-5" />
                  Detector de Plágio
                </Button>
              </div>
            </div>
          )}

          {/* Trilhas Section */}
          {trilhas.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma trilha encontrada</h3>
              <p className="text-muted-foreground">
                Não há trilhas de treinamento disponíveis no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {trilhas.map((trilha) => (
                <div key={trilha.id} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{trilha.title}</h3>
                    <p className="text-muted-foreground">{trilha.description}</p>
                  </div>

                  {/* Curso vinculado */}
                  {(() => {
                    const course = courses.find(c => c.id === trilha.courseId);
                    if (!course) {
                      return (
                        <div className="flex items-center gap-3 py-6 px-4 bg-muted/50 rounded-lg text-muted-foreground">
                          <BookOpen className="w-8 h-8 shrink-0" />
                          <p className="text-sm">Nenhum curso vinculado a esta trilha.</p>
                        </div>
                      );
                    }
                    return (
                      <Link
                        href={`/ava/course/${course.id}`}
                        className="group flex items-start justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <GraduationCap className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {course.title}
                            </p>
                            {course.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                            )}
                            <span className="inline-block text-xs font-medium text-primary">Acessar curso →</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-primary transition-colors mt-1" />
                      </Link>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{trilhas.length}</div>
              <div className="text-sm text-muted-foreground">
                Trilha{trilhas.length !== 1 ? 's' : ''} Disponível{trilhas.length !== 1 ? 'eis' : ''}
              </div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{linkedCourses.length}</div>
              <div className="text-sm text-muted-foreground">
                Curso{linkedCourses.length !== 1 ? 's' : ''} Disponível{linkedCourses.length !== 1 ? 'is' : ''}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}