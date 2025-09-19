"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/lib/context";
import { api } from "@/lib/api";
import { Search, Plus, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Tipos de prova disponíveis
const TIPOS_PROVA = [
  "Capela",
  "Salem",
  "Ex-Templario",
  "Triade",
  "Ebano",
  "Anon",
  "Cadencia"
] as const;

type TipoProva = typeof TIPOS_PROVA[number];

// Função para obter o número máximo de questões por tipo
const getMaxQuestoes = (tipoProva: TipoProva): number => {
  if (["Capela", "Salem", "Ex-Templario", "Triade"].includes(tipoProva)) {
    return 5;
  }
  return 10; // Ebano, Anon, Cadencia
};

interface SearchResult {
  id: string | number;
  score: number;
  payload: {
    provaId: string;
    tipoProva: string;
    numeroQuestao: number;
    text: string;
    createdAt: string;
  };
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  message: string;
}

interface AddResponse {
  success: boolean;
  data: {
    id: string;
    success: boolean;
  };
  message: string;
}

export default function PlagioPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  // Estado para controlar a tab ativa
  const [activeTab, setActiveTab] = useState("consultar");

  // Estados para consulta
  const [consultaForm, setConsultaForm] = useState({
    query: "",
    provaId: "",
    tipoProva: "" as TipoProva | "",
    numeroQuestao: 1,
  });

  // Estados para adicionar
  const [adicionarForm, setAdicionarForm] = useState({
    text: "",
    provaId: "",
    tipoProva: "" as TipoProva | "",
    numeroQuestao: 1,
  });

  // Estados de loading e resultados
  const [isConsultando, setIsConsultando] = useState(false);
  const [isAdicionando, setIsAdicionando] = useState(false);
  const [resultadoConsulta, setResultadoConsulta] = useState<string | null>(null);
  const [mensagemAdicionar, setMensagemAdicionar] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Redirect se não estiver logado
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleConsulta = async () => {
    if (!consultaForm.query.trim() || !consultaForm.provaId.trim() || !consultaForm.tipoProva) {
      setErro("Preencha todos os campos obrigatórios para consulta");
      return;
    }

    setIsConsultando(true);
    setErro(null);
    setResultadoConsulta(null);

    try {
      const response = await api.post<SearchResponse>('/embedding/search-documents', {
        query: consultaForm.query,
        provaId: consultaForm.provaId,
        tipoProva: consultaForm.tipoProva,
        numeroQuestao: consultaForm.numeroQuestao,
        limit: 10
      });

      if (response.success && response.data.length > 0) {
        // Verificar se algum resultado tem similaridade > 80% (score > 0.8)
        const resultadoSimilar = response.data.find(result => result.score > 0.8);

        if (resultadoSimilar) {
          setResultadoConsulta(
            `⚠️ Possível plágio detectado! Prova similar encontrada: ${resultadoSimilar.payload.provaId} (Similaridade: ${(resultadoSimilar.score * 100).toFixed(1)}%)`
          );
        } else {
          setResultadoConsulta(null); // Não exibir nada se não há similaridade alta
        }
      } else {
        setResultadoConsulta(null); // Não exibir nada se não há resultados
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao realizar consulta');
    } finally {
      setIsConsultando(false);
    }
  };

  const handleAdicionar = async () => {
    if (!adicionarForm.text.trim() || !adicionarForm.provaId.trim() || !adicionarForm.tipoProva) {
      setErro("Preencha todos os campos obrigatórios para adicionar");
      return;
    }

    setIsAdicionando(true);
    setErro(null);
    setMensagemAdicionar(null);

    try {
      const response = await api.post<AddResponse>('/embedding/add-document', {
        text: adicionarForm.text,
        provaId: adicionarForm.provaId,
        tipoProva: adicionarForm.tipoProva,
        numeroQuestao: adicionarForm.numeroQuestao
      });

      if (response.success) {
        setMensagemAdicionar("✅ Questão adicionada com sucesso!");
        // Limpar formulário
        setAdicionarForm({
          text: "",
          provaId: "",
          tipoProva: "" as TipoProva | "",
          numeroQuestao: 1,
        });
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao adicionar questão');
    } finally {
      setIsAdicionando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBackToDashboard={true}>
        <span className="font-semibold">Detector de Plágio</span>
      </AppHeader>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header da página */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Detector de Plágio</h1>
            <p className="text-muted-foreground">
              Consulte possíveis plágios ou adicione novas questões ao banco de dados
            </p>
          </div>

          {/* Alerta de erro global */}
          {erro && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {/* Tabs para Consultar/Adicionar */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="consultar" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Consultar Plágio
              </TabsTrigger>
              <TabsTrigger value="adicionar" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Questão
              </TabsTrigger>
            </TabsList>

            {/* Tab de Consulta */}
            <TabsContent value="consultar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Consultar Possível Plágio
                  </CardTitle>
                  <CardDescription>
                    Digite o texto da questão para verificar se existe conteúdo similar no banco de dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consulta-prova-id">ID da Prova *</Label>
                      <Input
                        id="consulta-prova-id"
                        placeholder="Ex: PROV001"
                        value={consultaForm.provaId}
                        onChange={(e) => setConsultaForm(prev => ({ ...prev, provaId: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consulta-tipo">Tipo da Prova *</Label>
                      <Select
                        value={consultaForm.tipoProva}
                        onValueChange={(value) => setConsultaForm(prev => ({ ...prev, tipoProva: value as TipoProva }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_PROVA.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consulta-questao">Número da Questão *</Label>
                      <Select
                        value={consultaForm.numeroQuestao.toString()}
                        onValueChange={(value) => setConsultaForm(prev => ({ ...prev, numeroQuestao: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: consultaForm.tipoProva ? getMaxQuestoes(consultaForm.tipoProva) : 10 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Questão {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consulta-texto">Texto da Questão *</Label>
                    <Textarea
                      id="consulta-texto"
                      placeholder="Cole aqui o texto da questão que deseja verificar..."
                      className="min-h-[150px]"
                      value={consultaForm.query}
                      onChange={(e) => setConsultaForm(prev => ({ ...prev, query: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={handleConsulta}
                    disabled={isConsultando}
                    className="w-full"
                  >
                    {isConsultando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Consultar Plágio
                      </>
                    )}
                  </Button>

                  {/* Resultado da consulta */}
                  {resultadoConsulta && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{resultadoConsulta}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Adicionar */}
            <TabsContent value="adicionar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Adicionar Nova Questão
                  </CardTitle>
                  <CardDescription>
                    Adicione uma nova questão ao banco de dados para futuras consultas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adicionar-prova-id">ID da Prova *</Label>
                      <Input
                        id="adicionar-prova-id"
                        placeholder="Ex: PROV001"
                        value={adicionarForm.provaId}
                        onChange={(e) => setAdicionarForm(prev => ({ ...prev, provaId: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adicionar-tipo">Tipo da Prova *</Label>
                      <Select
                        value={adicionarForm.tipoProva}
                        onValueChange={(value) => setAdicionarForm(prev => ({ ...prev, tipoProva: value as TipoProva }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_PROVA.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adicionar-questao">Número da Questão *</Label>
                      <Select
                        value={adicionarForm.numeroQuestao.toString()}
                        onValueChange={(value) => setAdicionarForm(prev => ({ ...prev, numeroQuestao: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: adicionarForm.tipoProva ? getMaxQuestoes(adicionarForm.tipoProva) : 10 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Questão {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adicionar-texto">Texto da Questão *</Label>
                    <Textarea
                      id="adicionar-texto"
                      placeholder="Cole aqui o texto da questão que deseja adicionar ao banco de dados..."
                      className="min-h-[150px]"
                      value={adicionarForm.text}
                      onChange={(e) => setAdicionarForm(prev => ({ ...prev, text: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={handleAdicionar}
                    disabled={isAdicionando}
                    className="w-full"
                  >
                    {isAdicionando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Questão
                      </>
                    )}
                  </Button>

                  {/* Mensagem de sucesso */}
                  {mensagemAdicionar && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{mensagemAdicionar}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Informações sobre os tipos de prova */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações sobre Tipos de Prova</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Questões 1-5:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Capela</li>
                    <li>• Salem</li>
                    <li>• Ex-Templario</li>
                    <li>• Triade</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Questões 1-10:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Ebano</li>
                    <li>• Anon</li>
                    <li>• Cadencia</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}