"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { videoService, trilhaService } from "@/lib/services";
import { Video as ApiVideo, Trilha as ApiTrilha } from "@/lib/services";
import { Plus, Edit, Trash2, Video, RefreshCw, AlertCircle, ExternalLink, PlayCircle } from "lucide-react";

interface VideoFormData {
  title: string;
  description: string;
  youtubeId: string;
  trilha: string;
}

export function VideoManagement() {
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [trilhas, setTrilhas] = useState<ApiTrilha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ApiVideo | null>(null);
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    youtubeId: "",
    trilha: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [videosResponse, trilhasResponse] = await Promise.all([
        videoService.listVideos(),
        trilhaService.listTrilhas()
      ]);

      if (videosResponse.success && videosResponse.data) {
        setVideos(videosResponse.data);
      } else {
        setError("Erro ao carregar vídeos");
      }

      if (trilhasResponse.success && trilhasResponse.data) {
        setTrilhas(trilhasResponse.data);
      } else {
        console.warn("Erro ao carregar trilhas:", trilhasResponse.message);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string => {
    // Remove spaces and trim
    url = url.trim();

    // If it's already just the ID
    if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return url; // Return as is if no pattern matches
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.youtubeId.trim()) {
      setError("Título, descrição e URL do YouTube são obrigatórios");
      return;
    }

    if (!formData.trilha) {
      setError("Selecione uma trilha para o vídeo");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const youtubeId = extractYouTubeId(formData.youtubeId);

      if (youtubeId.length !== 11) {
        setError("URL do YouTube inválida. Verifique o link e tente novamente.");
        setIsSubmitting(false);
        return;
      }

      const videoData = {
        title: formData.title,
        description: formData.description,
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        trilhaId: formData.trilha
      };

      if (editingVideo) {
        // Atualizar vídeo existente
        const response = await videoService.updateVideo(editingVideo._id, videoData);

        if (response.success) {
          await loadData();
          handleCloseDialog();
        } else {
          setError(response.message || "Erro ao atualizar vídeo");
        }
      } else {
        // Criar novo vídeo
        const response = await videoService.createVideo(videoData);

        if (response.success) {
          await loadData();
          handleCloseDialog();
        } else {
          setError(response.message || "Erro ao criar vídeo");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar vídeo:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video: ApiVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      trilha: video.trilha
    });
    setIsDialogOpen(true);
    setError("");
  };

  const handleDelete = async (video: ApiVideo) => {
    if (!confirm(`Tem certeza que deseja excluir o vídeo "${video.title}"?`)) {
      return;
    }

    try {
      setError("");
      const response = await videoService.deleteVideo(video._id);

      if (response.success) {
        await loadData();
      } else {
        setError(response.message || "Erro ao excluir vídeo");
      }
    } catch (error) {
      console.error("Erro ao excluir vídeo:", error);
      setError("Erro ao conectar com o servidor");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVideo(null);
    setFormData({ title: "", description: "", youtubeId: "", trilha: "" });
    setError("");
  };

  const getTrilhaName = (trilhaId: string) => {
    const trilha = trilhas.find(t => t._id === trilhaId);
    return trilha ? trilha.title : "Trilha não encontrada";
  };

  const getYouTubeUrl = (youtubeId: string) => {
    return `https://www.youtube.com/watch?v=${youtubeId}`;
  };

  const getThumbnailUrl = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando vídeos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vídeos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os vídeos do YouTube organizados por trilhas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingVideo(null);
                setFormData({ title: "", description: "", youtubeId: "", trilha: "" });
                setError("");
              }}
              disabled={trilhas.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? "Editar Vídeo" : "Novo Vídeo"}
                </DialogTitle>
                <DialogDescription>
                  {editingVideo
                    ? "Altere os dados do vídeo abaixo."
                    : "Preencha os dados para adicionar um novo vídeo do YouTube."
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
                    placeholder="Ex: Como usar React Hooks"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o conteúdo do vídeo"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="youtubeId">URL do YouTube</Label>
                  <Input
                    id="youtubeId"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... ou apenas o ID"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL completa do YouTube ou apenas o ID do vídeo
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="trilha">Trilha</Label>
                  <select
                    id="trilha"
                    value={formData.trilha}
                    onChange={(e) => setFormData({ ...formData, trilha: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione uma trilha</option>
                    {trilhas.map((trilha) => (
                      <option key={trilha._id} value={trilha._id}>
                        {trilha.title}
                      </option>
                    ))}
                  </select>
                  {trilhas.length === 0 && (
                    <p className="text-xs text-yellow-600">
                      Nenhuma trilha encontrada. Crie trilhas primeiro.
                    </p>
                  )}
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
                    editingVideo ? "Atualizar" : "Criar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aviso se não há trilhas */}
      {trilhas.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
          <AlertCircle className="w-4 h-4" />
          <span>Crie pelo menos uma trilha antes de adicionar vídeos.</span>
        </div>
      )}

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

      {/* Tabela de vídeos */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vídeo</TableHead>
              <TableHead>Trilha</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="text-center">Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum vídeo cadastrado</p>
                  {trilhas.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Clique em &ldquo;Novo Vídeo&rdquo; para começar
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Crie trilhas primeiro para organizar os vídeos
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{video.title}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate" title={video.description}>
                        {video.description}
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {video.youtubeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTrilhaName(video.trilha)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Image
                        src={getThumbnailUrl(video.youtubeId)}
                        alt={video.title}
                        width={64}
                        height={48}
                        className="w-16 h-12 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getYouTubeUrl(video.youtubeId), '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          YouTube
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/video/${video._id}`, '_blank')}
                          className="text-xs"
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Player
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(video)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(video)}
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