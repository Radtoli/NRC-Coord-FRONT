import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/config/trilhas";
import Link from "next/link";
import Image from "next/image";
import { Play, Clock } from "lucide-react";

interface VideoCardProps {
  video: Video;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`} className={className}>
      <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-3">
            <Image
              src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-3 group-hover:bg-white group-hover:scale-110 transition-all">
                <Play className="w-6 h-6 text-primary fill-current" />
              </div>
            </div>
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 bg-black/70 text-white border-none"
            >
              <Clock className="w-3 h-3 mr-1" />
              {video.duration}
            </Badge>
          </div>
          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        </CardContent>
        <CardFooter className="pt-2">
          <Badge variant="outline" className="text-xs">
            {video.documents.length} documento{video.documents.length !== 1 ? 's' : ''}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}