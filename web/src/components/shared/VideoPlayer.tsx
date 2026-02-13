interface VideoPlayerProps {
  src: string;
  posterUrl?: string;
}

export function VideoPlayer({ src, posterUrl }: VideoPlayerProps) {
  return (
    <video
      className="h-full w-full rounded-lg border bg-black"
      controls
      preload="metadata"
      poster={posterUrl}
      src={src}
    >
      Your browser does not support HTML5 video playback.
    </video>
  );
}
