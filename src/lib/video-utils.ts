/**
 * Converte URLs de vídeo para formato embed
 */
export function getEmbedUrl(url: string): string {
  if (!url) return ''
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }
  
  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  
  // Se já é URL embed ou outro formato, retorna como está
  return url
}

/**
 * Detecta a plataforma do vídeo
 */
export function getVideoPlatform(url: string): 'youtube' | 'vimeo' | 'custom' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo'
  }
  return 'custom'
}

