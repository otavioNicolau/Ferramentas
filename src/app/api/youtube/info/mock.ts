// Mock de dados para demonstração quando a API do YouTube não funciona
export const mockVideoData = {
  title: "Exemplo de Vídeo do YouTube",
  author: "Canal de Exemplo",
  videoId: "dQw4w9WgXcQ",
  lengthSeconds: 212,
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  formats: [
    // Formatos com vídeo + áudio (apenas qualidades baixas/médias)
    {
      itag: 18,
      qualityLabel: "360p", 
      container: "mp4",
      quality: "medium",
      hasVideo: true,
      hasAudio: true,
      sizeInMB: "18.7 MB",
      contentLength: "19611648",
      type: "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\""
    },
    {
      itag: 22,
      qualityLabel: "720p",
      container: "mp4",
      quality: "hd720",
      hasVideo: true,
      hasAudio: true,
      sizeInMB: "45.2 MB",
      contentLength: "47394816",
      type: "video/mp4; codecs=\"avc1.64001F, mp4a.40.2\""
    },
    // Formatos de alta qualidade (apenas vídeo, sem áudio)
    {
      itag: 137,
      qualityLabel: "1080p",
      container: "mp4",
      quality: "hd1080",
      hasVideo: true,
      hasAudio: false,
      sizeInMB: "68.2 MB",
      contentLength: "71524352",
      type: "video/mp4; codecs=\"avc1.640028\""
    },
    {
      itag: 135,
      qualityLabel: "480p",
      container: "mp4",
      quality: "large",
      hasVideo: true,
      hasAudio: false,
      sizeInMB: "10.3 MB",
      contentLength: "10797056",
      type: "video/mp4; codecs=\"avc1.4d401e\""
    },
    // Formatos apenas de áudio
    {
      itag: 140,
      qualityLabel: "Audio",
      container: "m4a",
      quality: "tiny",
      hasVideo: false,
      hasAudio: true,
      sizeInMB: "3.4 MB",
      contentLength: "3565568",
      type: "audio/mp4; codecs=\"mp4a.40.2\""
    }
  ]
};

export function generateMockDataForUrl(url: string) {
  // Extrair o ID do vídeo da URL
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/(u\/\w\/))|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[7].length === 11) ? match[7] : 'dQw4w9WgXcQ';
  
  return {
    ...mockVideoData,
    videoId,
    title: `Vídeo de Demonstração (${videoId})`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  };
}
