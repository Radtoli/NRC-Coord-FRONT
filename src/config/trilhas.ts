export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  documents: Document[];
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'xlsx';
  url: string;
  size: string;
}

export interface Trilha {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

export const trilhas: Trilha[] = [
  {
    id: "1",
    title: "Bem vindo ao sistema de Ensino",
    description: "Formação e complementos básicos para corretores do NRC",
    videos: [
      {
        id: "1",
        title: "Introdução ao Treinamento",
        description: "Conceitos básicos e fundamentais para corretores do NRC",
        youtubeId: "dGcsHMXbSOA",
        duration: "15:30",
        documents: [
          {
            id: "doc1",
            title: "Slides - Introdução ao React",
            type: "pdf",
            url: "/docs/react-intro.pdf",
            size: "2.5 MB"
          },
          {
            id: "doc2",
            title: "Exercícios Práticos",
            type: "doc",
            url: "/docs/react-exercises.docx",
            size: "1.2 MB"
          }
        ]
      },
      {
        id: "2",
        title: "Componentes e Props",
        description: "Como criar e utilizar componentes com propriedades",
        youtubeId: "SqcY0GlETPk",
        duration: "18:45",
        documents: [
          {
            id: "doc3",
            title: "Exemplos de Componentes",
            type: "pdf",
            url: "/docs/components-examples.pdf",
            size: "3.1 MB"
          }
        ]
      },
      {
        id: "3",
        title: "State e Hooks",
        description: "Gerenciamento de estado com useState e useEffect",
        youtubeId: "O6P86uwfdR0",
        duration: "22:15",
        documents: [
          {
            id: "doc4",
            title: "Guia de Hooks",
            type: "pdf",
            url: "/docs/hooks-guide.pdf",
            size: "4.2 MB"
          },
          {
            id: "doc5",
            title: "Código de Exemplo",
            type: "doc",
            url: "/docs/hooks-examples.docx",
            size: "800 KB"
          }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Next.js Avançado",
    description: "Conceitos avançados do framework Next.js",
    videos: [
      {
        id: "4",
        title: "Server-Side Rendering",
        description: "Implementando SSR e SSG no Next.js",
        youtubeId: "Sklc_fQBmcs",
        duration: "25:30",
        documents: [
          {
            id: "doc6",
            title: "SSR vs SSG Comparação",
            type: "pdf",
            url: "/docs/ssr-ssg-comparison.pdf",
            size: "1.8 MB"
          }
        ]
      },
      {
        id: "5",
        title: "API Routes",
        description: "Criando APIs com Next.js",
        youtubeId: "xkkqJdOmCM8",
        duration: "19:20",
        documents: [
          {
            id: "doc7",
            title: "Exemplos de API Routes",
            type: "doc",
            url: "/docs/api-routes-examples.docx",
            size: "2.1 MB"
          },
          {
            id: "doc8",
            title: "Middleware e Autenticação",
            type: "pdf",
            url: "/docs/middleware-auth.pdf",
            size: "3.5 MB"
          }
        ]
      }
    ]
  },
  {
    id: "3",
    title: "Desenvolvimento Mobile",
    description: "Criando aplicações mobile com React Native",
    videos: [
      {
        id: "6",
        title: "Configuração do Ambiente",
        description: "Setup inicial para desenvolvimento React Native",
        youtubeId: "0-S5a0eXPoc",
        duration: "30:45",
        documents: [
          {
            id: "doc9",
            title: "Guia de Instalação",
            type: "pdf",
            url: "/docs/rn-setup-guide.pdf",
            size: "5.2 MB"
          }
        ]
      },
      {
        id: "7",
        title: "Navegação e Layout",
        description: "Implementando navegação entre telas",
        youtubeId: "9bXhqFJHklQ",
        duration: "24:10",
        documents: [
          {
            id: "doc10",
            title: "Padrões de Navegação",
            type: "ppt",
            url: "/docs/navigation-patterns.pptx",
            size: "4.8 MB"
          },
          {
            id: "doc11",
            title: "Exercícios de Layout",
            type: "xlsx",
            url: "/docs/layout-exercises.xlsx",
            size: "1.5 MB"
          }
        ]
      }
    ]
  }
];

export const getVideoById = (id: string): Video | undefined => {
  for (const trilha of trilhas) {
    const video = trilha.videos.find(v => v.id === id);
    if (video) return video;
  }
  return undefined;
};

export const getTrilhaByVideoId = (videoId: string): Trilha | undefined => {
  return trilhas.find(trilha =>
    trilha.videos.some(video => video.id === videoId)
  );
};