"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/config/trilhas";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Clock } from "lucide-react";

interface SidebarVideosProps {
  videos: Video[];
  trilhaTitle: string;
}

export function SidebarVideos({ videos, trilhaTitle }: SidebarVideosProps) {
  const params = useParams();
  const currentVideoId = params?.id as string;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">
          {trilhaTitle}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {videos.length} vídeo{videos.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-2 p-6 pt-0">
            {videos.map((video, index) => (
              <Link
                key={video.id}
                href={`/video/${video.id}`}
                className={`block p-3 rounded-lg border transition-all hover:bg-accent ${currentVideoId === video.id
                    ? 'bg-primary/10 border-primary'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-12 h-8 bg-muted rounded overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {currentVideoId === video.id ? (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      ) : (
                        <Play className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </Badge>
                    </div>
                    <h4 className={`text-sm font-medium line-clamp-2 ${currentVideoId === video.id ? 'text-primary' : ''
                      }`}>
                      {video.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {video.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}