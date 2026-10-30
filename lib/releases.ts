export const REPO = 'pshenmic/dash-desktop-wallet'
export const REPO_URL = `https://github.com/${REPO}`
export const RELEASES_URL = `${REPO_URL}/releases`
export const LATEST_URL = `${RELEASES_URL}/latest`
const API = `https://api.github.com/repos/${REPO}`

// How long GitHub responses are cached on the server, in seconds
const REVALIDATE = 300

export type Platform = 'mac' | 'windows' | 'linux'
export type Arch = 'x64' | 'arm64' | 'universal'

export const PLATFORMS: Platform[] = ['mac', 'windows', 'linux']

export const PLATFORM_NAMES: Record<Platform, string> = {
  mac: 'macOS',
  windows: 'Windows',
  linux: 'Linux'
}

export const ARCH_NAMES: Record<Arch, string> = {
  universal: 'Universal',
  x64: 'x64',
  arm64: 'arm64'
}

// Preferred package per platform for the big hero button
const PRIMARY_KIND: Record<Platform, string> = {
  mac: 'dmg',
  windows: 'exe',
  linux: 'appimage'
}

interface GithubAsset {
  name: string
  size: number
  browser_download_url: string
}

interface GithubRelease {
  tag_name: string
  html_url: string
  prerelease: boolean
  published_at: string
  assets: GithubAsset[]
}

export interface Download {
  platform: Platform
  arch: Arch
  kind: string
  label: string
  name: string
  size: number
  url: string
}

export interface Release {
  tag: string
  url: string
  prerelease: boolean
  publishedAt: string
  downloads: Download[]
}

interface Rule {
  test: RegExp
  platform: Platform
  kind: string
  label: string
}

// Matches the file names produced by the wallet's electron-builder config, e.g.
// dash-desktop-1.0.0-mac-universal.dmg, dash-desktop-1.0.0-win-x64-setup.exe
const RULES: Rule[] = [
  { test: /\.dmg$/i, platform: 'mac', kind: 'dmg', label: 'Disk image (.dmg)' },
  { test: /\.exe$/i, platform: 'windows', kind: 'exe', label: 'Installer (.exe)' },
  { test: /\.AppImage$/i, platform: 'linux', kind: 'appimage', label: 'AppImage' },
  { test: /\.deb$/i, platform: 'linux', kind: 'deb', label: 'Debian package (.deb)' },
  { test: /\.snap$/i, platform: 'linux', kind: 'snap', label: 'Snap package (.snap)' }
]

function archOf(name: string): Arch {
  if (/universal/i.test(name)) return 'universal'
  if (/arm64|aarch64/i.test(name)) return 'arm64'
  return 'x64'
}

function toDownloads(assets: GithubAsset[]): Download[] {
  const downloads: Download[] = []
  for (const asset of assets) {
    const rule = RULES.find((r) => r.test.test(asset.name))
    if (!rule) continue
    downloads.push({
      platform: rule.platform,
      arch: archOf(asset.name),
      kind: rule.kind,
      label: rule.label,
      name: asset.name,
      size: asset.size,
      url: asset.browser_download_url
    })
  }
  // Group by package type in RULES order, x64 before arm64
  const kindOrder = RULES.map((r) => r.kind)
  return downloads.sort(
    (a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) || (a.arch === 'arm64' ? 1 : 0) - (b.arch === 'arm64' ? 1 : 0)
  )
}

async function getJson<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  // Optional: raises the GitHub API rate limit from 60 to 5000 requests per hour
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const res = await fetch(`${API}${path}`, { headers, next: { revalidate: REVALIDATE } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
  return (await res.json()) as T
}

/**
 * Returns the latest stable release. Until a stable release exists,
 * falls back to the newest pre-release so the page is never empty.
 * Returns null if GitHub is unreachable; the page then links to GitHub Releases.
 */
export async function getLatestRelease(): Promise<Release | null> {
  try {
    let release = await getJson<GithubRelease>('/releases/latest')
    if (!release) {
      const all = await getJson<GithubRelease[]>('/releases?per_page=1')
      release = all?.[0] ?? null
    }
    if (!release) return null

    return {
      tag: release.tag_name,
      url: release.html_url,
      prerelease: release.prerelease,
      publishedAt: release.published_at,
      downloads: toDownloads(release.assets)
    }
  } catch (err) {
    console.warn('Could not load release info:', err)
    return null
  }
}

/** Detects the visitor's OS from request headers. */
export function detectPlatform(userAgent: string, chPlatform: string): { platform: Platform | null; arch: Arch | null } {
  const source = `${chPlatform} ${userAgent}`

  // Phones and tablets can't run a desktop wallet
  if (/Android|iPhone|iPad|iPod/i.test(userAgent)) return { platform: null, arch: null }

  if (/Mac/i.test(source)) return { platform: 'mac', arch: 'universal' }
  if (/Win/i.test(source)) return { platform: 'windows', arch: 'x64' }
  if (/Linux|X11|CrOS/i.test(source)) {
    return { platform: 'linux', arch: /aarch64|arm64|armv8/i.test(userAgent) ? 'arm64' : 'x64' }
  }
  return { platform: null, arch: null }
}

export function pickPrimary(downloads: Download[], platform: Platform, arch: Arch | null): Download | null {
  const candidates = downloads.filter((d) => d.platform === platform && d.kind === PRIMARY_KIND[platform])
  return candidates.find((d) => d.arch === arch) ?? candidates[0] ?? null
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
