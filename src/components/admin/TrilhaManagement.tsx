"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trilhaService, videoService } from "@/lib/services";
import { Trilha as ApiTrilha, Video as ApiVideo } from "@/lib/services";
import { Plus, Edit, Trash2, BookOpen, RefreshCw, AlertCircle } from "lucide-react";

interface TrilhaFormData {
  title: string;
  description: string;
}

export function TrilhaManagement() {
  const [trilhas, setTrilhas] = useState<ApiTrilha[]>([]);
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrilha, setEditingTrilha] = useState<ApiTrilha | null>(null);
  const [formData, setFormData] = useState<TrilhaFormData>({
    title: "",
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [trilhasResponse, videosResponse] = await Promise.all([
        trilhaService.listTrilhas(),
        videoService.listVideos()
      ]);

      if (trilhasResponse.success && trilhasResponse.data) {
        setTrilhas(trilhasResponse.data);
      } else {
        setError("Erro ao carregar trilhas");
      }

      if (videosResponse.success && videosResponse.data) {
        setVideos(videosResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Título e descrição são obrigatórios");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      if (editingTrilha) {
        // Atualizar trilha existente
        const response = await trilhaService.updateTrilha(editingTrilha._id, {
          title: formData.title,
          description: formData.description
        });

        if (response.success) {
          await loadData();
          handleCloseDialog();
        } else {
          setError(response.message || "Erro ao atualizar trilha");
        }
      } else {
        // Criar nova trilha
        const response = await trilhaService.createTrilha({
          title: formData.title,
          description: formData.description
        });

        if (response.success) {
          await loadData();
          handleCloseDialog();
        } else {
          setError(response.message || "Erro ao criar trilha");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar trilha:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (trilha: ApiTrilha) => {
    setEditingTrilha(trilha);
    setFormData({
      title: trilha.title,
      description: trilha.description
    });
    setIsDialogOpen(true);
    setError("");
  };

  const handleDelete = async (trilha: ApiTrilha) => {
    if (!confirm(`Tem certeza que deseja excluir a trilha "${trilha.title}"?`)) {
      return;
    }

    try {
      setError("");
      const response = await trilhaService.deleteTrilha(trilha._id);

      if (response.success) {
        await loadData();
      } else {
        setError(response.message || "Erro ao excluir trilha");
      }
    } catch (error) {
      console.error("Erro ao excluir trilha:", error);
      setError("Erro ao conectar com o servidor");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrilha(null);
    setFormData({ title: "", description: "" });
    setError("");
  };

  const getVideoCount = (trilhaId: string) => {
    return videos.filter(video => video.trilha === trilhaId).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando trilhas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trilhas de Aprendizado</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as trilhas que agrupam vídeos por temas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTrilha(null); setFormData({ title: "", description: "" }); setError(""); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Trilha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTrilha ? "Editar Trilha" : "Nova Trilha"}
                </DialogTitle>
                <DialogDescription>
                  {editingTrilha 
                    ? "Altere os dados da trilha abaixo." 
                    : "Preencha os dados para criar uma nova trilha de aprendizado."
                  }
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
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Introdução ao React"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o conteúdo da trilha"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingTrilha ? "Atualizar" : "Criar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mensagem de erro geral */}
      {error && !isDialogOpen && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
          <AlertCircle className="w-4 h-4" />
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError("")}
            className="ml-auto"
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Tabela de trilhas */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trilha</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-center">Vídeos</TableHead>
              <TableHead className="text-center">Criada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trilhas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma trilha cadastrada</p>
                  <p className="text-sm text-muted-foreground">
                    Clique em &ldquo;Nova Trilha&rdquo; para começar
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              trilhas.map((trilha) => (
                <TableRow key={trilha._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trilha.title}</div>
                      <div className="text-xs text-muted-foreground">ID: {trilha._id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={trilha.description}>
                      {trilha.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {getVideoCount(trilha._id)} vídeos
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(trilha.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trilha)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(trilha)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Botão de atualizar */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </Button>
      </div>
    </div>
  );
}