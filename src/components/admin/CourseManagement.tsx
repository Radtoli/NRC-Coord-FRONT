"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { avaService, Course } from "@/lib/services/ava.service";
import { trilhaService } from "@/lib/services";
import { Trilha as ApiTrilha } from "@/lib/services";
import { clearTrilhasCache } from "@/config/trilhas";
import { RefreshCw, AlertCircle, Link2, Link2Off, GraduationCap } from "lucide-react";

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trilhas, setTrilhas] = useState<ApiTrilha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTrilhaId, setSelectedTrilhaId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [coursesData, trilhasResponse] = await Promise.all([
        avaService.listCourses().catch(() => [] as Course[]),
        trilhaService.listTrilhas(),
      ]);
      setCourses(coursesData);
      if (trilhasResponse.success && trilhasResponse.data) {
        setTrilhas(trilhasResponse.data);
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  /** Retorna a trilha atualmente vinculada a um curso (se houver). */
  const linkedTrilha = (courseId: string) =>
    trilhas.find((t) => t.courseId === courseId) ?? null;

  const openDialog = (course: Course) => {
    const current = linkedTrilha(course.id);
    setSelectedCourse(course);
    setSelectedTrilhaId(current?._id ?? "__none__");
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    setError("");

    try {
      const currentTrilha = linkedTrilha(selectedCourse.id);
      const newTrilhaId = selectedTrilhaId === "__none__" ? null : selectedTrilhaId;

      // Desvincula da trilha anterior (se for diferente)
      if (currentTrilha && currentTrilha._id !== newTrilhaId) {
        await trilhaService.updateTrilha(currentTrilha._id, { courseId: null });
      }

      // Vincula à nova trilha
      if (newTrilhaId) {
        await trilhaService.updateTrilha(newTrilhaId, { courseId: selectedCourse.id });
      }

      clearTrilhasCache(); // força dashboard a buscar dados frescos
      await loadData();
      setDialogOpen(false);
      setSelectedCourse(null);
    } catch {
      setError("Erro ao salvar vínculo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando cursos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vínculos Curso ↔ Trilha</h3>
          <p className="text-sm text-muted-foreground">
            Vincule cada curso a uma trilha para que ele apareça na tela principal dos alunos.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {error && !dialogOpen && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trilha vinculada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum curso encontrado.</p>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => {
                const linked = linkedTrilha(course.id);
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-xs text-muted-foreground">ID: {course.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          course.status === "published"
                            ? "default"
                            : course.status === "archived"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {course.status === "published"
                          ? "Publicado"
                          : course.status === "archived"
                            ? "Arquivado"
                            : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {linked ? (
                        <div className="flex items-center gap-1.5 text-sm text-primary">
                          <Link2 className="w-4 h-4" />
                          {linked.title}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Link2Off className="w-4 h-4" />
                          Sem trilha
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(course)}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de vínculo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Vincular curso a uma trilha</DialogTitle>
            <DialogDescription>
              Escolha a trilha em que o curso <strong>{selectedCourse?.title}</strong> deve aparecer.
              Selecione &quot;Nenhuma&quot; para desvincular.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="trilha-select">Trilha</Label>
              <select
                id="trilha-select"
                value={selectedTrilhaId}
                onChange={(e) => setSelectedTrilhaId(e.target.value)}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="__none__">Nenhuma</option>
                {trilhas.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                    {t.courseId && t.courseId !== selectedCourse?.id
                      ? " (já possui curso)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
