import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/config/trilhas";
import { Download, FileText, File, FileSpreadsheet, Presentation } from "lucide-react";

interface DownloadDocsProps {
  documents: Document[];
  className?: string;
}

const getFileIcon = (type: Document['type']) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4" />;
    case 'doc':
      return <File className="w-4 h-4" />;
    case 'xlsx':
      return <FileSpreadsheet className="w-4 h-4" />;
    case 'ppt':
      return <Presentation className="w-4 h-4" />;
    default:
      return <File className="w-4 h-4" />;
  }
};

const getFileColor = (type: Document['type']) => {
  switch (type) {
    case 'pdf':
      return 'text-red-600';
    case 'doc':
      return 'text-blue-600';
    case 'xlsx':
      return 'text-green-600';
    case 'ppt':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export function DownloadDocs({ documents, className }: DownloadDocsProps) {
  const handleDownload = (document: Document) => {
    // Em uma aplicação real, aqui faria o download do arquivo
    console.log(`Downloading ${document.title}`);
    // Simula o download abrindo o link
    window.open(document.url, '_blank');
  };

  if (documents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum documento disponível para este vídeo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Documentos para Download</CardTitle>
        <p className="text-sm text-muted-foreground">
          {documents.length} documento{documents.length !== 1 ? 's' : ''} disponível{documents.length !== 1 ? 'eis' : ''}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 ${getFileColor(document.type)}`}>
                {getFileIcon(document.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-1">
                  {document.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {document.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {document.size}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(document)}
              className="flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}