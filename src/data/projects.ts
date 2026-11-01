import raw from './projects.json'
import type { Lang } from '../i18n/LanguageContext'

export type Localized = Record<Lang, string>

export interface Project {
  id: string
  title: Localized
  description: Localized
  client: string
  year: number
  category: string
  tools: string[]
  /** File name inside public/projects/<id>/ or a full https:// URL */
  thumbnail: string
  previewVideo?: string
  /** Local mp4 file name, or a YouTube / Vimeo URL */
  fullVideo?: string
  gallery: string[]
}

export const projects = raw as Project[]

export const categories = Array.from(new Set(projects.map((p) => p.category)))

export function getProject(id: string | undefined) {
  return projects.find((p) => p.id === id)
}

export function getNextProject(id: string) {
  const i = projects.findIndex((p) => p.id === id)
  return projects[(i + 1) % projects.length]
}

const isExternal = (path: string) => /^(https?:)?\/\//.test(path)

/** Resolves a path relative to the /public folder, respecting the GitHub Pages base path. */
export function publicUrl(path: string) {
  if (isExternal(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}

/** Resolves a project file: "thumb.jpg" -> /<base>/projects/<id>/thumb.jpg */
export function projectAsset(project: Project, file: string) {
  if (isExternal(file) || file.startsWith('/')) return publicUrl(file)
  return publicUrl(`projects/${project.id}/${file}`)
}

export type VideoSource =
  | { kind: 'file'; src: string }
  | { kind: 'youtube'; id: string; embed: string }
  | { kind: 'vimeo'; id: string; embed: string }

export function parseVideo(url: string, resolve: (file: string) => string = publicUrl): VideoSource {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) {
    return {
      kind: 'youtube',
      id: yt[1],
      embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    }
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) {
    return {
      kind: 'vimeo',
      id: vm[1],
      embed: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`,
    }
  }
  return { kind: 'file', src: resolve(url) }
}
