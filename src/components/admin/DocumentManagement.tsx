"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { documentService } from "@/lib/services";
import { Document as ApiDocument } from "@/lib/services";
import { Plus, Edit, Trash2, FileText, RefreshCw, AlertCircle, ExternalLink, Download } from "lucide-react";

interface DocumentFormData {
  title: string;
  type: string;
  url: string;
}

export function DocumentManagement() {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ApiDocument | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    type: "",
    url: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await documentService.listDocuments();

      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setError("Erro ao carregar documentos");
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.type.trim() || !formData.url.trim()) {
      setError("Título, tipo e URL são obrigatórios");
      return;
    }

    // Validação básica de URL
    try {
      new URL(formData.url);
    } catch {
      setError("URL inválida. Digite uma URL válida (ex: https://exemplo.com/arquivo.pdf)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const documentData = {
        title: formData.title,
        type: formData.type,
        url: formData.url,
        size: "unknown" // Placeholder já que não temos como determinar o tamanho sem fazer o download
      };

      if (editingDocument) {
        // Atualizar documento existente
        const response = await documentService.updateDocument(editingDocument._id, documentData);

        if (response.success) {
          await loadData();
          handleCloseDialog();
        } else {
          setError(response.message || "Erro ao atualizar documento");
        }
      } else {
        // Criar novo documento
        const response = await documentService.createDocument(documentData);

        if (response.success) {
          await loadData();
          handleCloseDialog();
        } else {
          setError(response.message || "Erro ao criar documento");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (document: ApiDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      type: document.type,
      url: document.url
    });
    setIsDialogOpen(true);
    setError("");
  };

  const handleDelete = async (document: ApiDocument) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${document.title}"?`)) {
      return;
    }

    try {
      setError("");
      const response = await documentService.deleteDocument(document._id);

      if (response.success) {
        await loadData();
      } else {
        setError(response.message || "Erro ao excluir documento");
      }
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      setError("Erro ao conectar com o servidor");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDocument(null);
    setFormData({ title: "", type: "", url: "" });
    setError("");
  };

  const getFileTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'pdf': 'bg-red-100 text-red-800',
      'doc': 'bg-blue-100 text-blue-800',
      'docx': 'bg-blue-100 text-blue-800',
      'xls': 'bg-green-100 text-green-800',
      'xlsx': 'bg-green-100 text-green-800',
      'ppt': 'bg-orange-100 text-orange-800',
      'pptx': 'bg-orange-100 text-orange-800',
      'txt': 'bg-gray-100 text-gray-800',
      'md': 'bg-purple-100 text-purple-800',
      'html': 'bg-yellow-100 text-yellow-800',
      'zip': 'bg-indigo-100 text-indigo-800',
      'rar': 'bg-indigo-100 text-indigo-800'
    };

    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (size: string): string => {
    // Se o tamanho não está disponível, retorna "N/A"
    if (!size || size === '0' || size === 'unknown') {
      return 'N/A';
    }

    const sizeNum = parseInt(size);
    if (isNaN(sizeNum)) return size;

    if (sizeNum < 1024) return `${sizeNum} B`;
    if (sizeNum < 1024 * 1024) return `${(sizeNum / 1024).toFixed(1)} KB`;
    if (sizeNum < 1024 * 1024 * 1024) return `${(sizeNum / (1024 * 1024)).toFixed(1)} MB`;
    return `${(sizeNum / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Documentos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie arquivos e documentos complementares
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDocument(null); setFormData({ title: "", type: "", url: "" }); setError(""); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingDocument ? "Editar Documento" : "Novo Documento"}
                </DialogTitle>
                <DialogDescription>
                  {editingDocument
                    ? "Altere os dados do documento abaixo."
                    : "Preencha os dados para adicionar um novo documento."
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
                    placeholder="Ex: Manual do Usuário"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Arquivo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Word (.doc)</option>
                    <option value="docx">Word (.docx)</option>
                    <option value="xls">Excel (.xls)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="ppt">PowerPoint (.ppt)</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="txt">Texto (.txt)</option>
                    <option value="md">Markdown (.md)</option>
                    <option value="html">HTML</option>
                    <option value="zip">ZIP</option>
                    <option value="rar">RAR</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="url">URL do Arquivo</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://exemplo.com/arquivo.pdf"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL completa para o arquivo hospedado externamente
                  </p>
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
                    editingDocument ? "Atualizar" : "Criar"
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

      {/* Tabela de documentos */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="text-center">Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum documento cadastrado</p>
                  <p className="text-sm text-muted-foreground">
                    Clique em &ldquo;Novo Documento&rdquo; para começar
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{document.title}</div>
                      <div className="text-xs text-muted-foreground">
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          {document.url.length > 50 ? `${document.url.substring(0, 50)}...` : document.url}
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFileTypeColor(document.type)}>
                      {document.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(document.size)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.url, '_blank')}
                        title="Abrir documento"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = globalThis.document.createElement('a');
                          link.href = document.url;
                          link.download = document.title;
                          globalThis.document.body.appendChild(link);
                          link.click();
                          globalThis.document.body.removeChild(link);
                        }}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(document)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(document)}
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