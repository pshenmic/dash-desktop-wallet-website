export const REPO = 'pshenmic/dash-desktop-wallet'
export const REPO_URL = `https://github.com/${REPO}`
export const RELEASES_URL = `${REPO_URL}/releases`
const API = `https://api.github.com/repos/${REPO}`

export type Platform = 'mac' | 'windows' | 'linux'
export type Arch = 'x64' | 'arm64' | 'universal'

export interface GithubAsset {
  name: string
  size: number
  browser_download_url: string
  download_count: number
}

export interface GithubRelease {
  tag_name: string
  name: string
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

export function toDownloads(release: GithubRelease): Download[] {
  const downloads: Download[] = []
  for (const asset of release.assets) {
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
  const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/vnd.github+json' } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
  return (await res.json()) as T
}

/**
 * Returns the latest stable release. Until a stable release exists,
 * falls back to the newest pre-release so the page is never empty.
 */
export async function fetchLatestRelease(): Promise<GithubRelease> {
  const stable = await getJson<GithubRelease>('/releases/latest')
  if (stable) return stable

  const all = await getJson<GithubRelease[]>('/releases?per_page=1')
  if (!all || all.length === 0) throw new Error('No releases published')
  return all[0]
}

export function detectPlatform(): { platform: Platform | null; arch: Arch | null } {
  const ua = navigator.userAgent
  const uaPlatform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? ''
  const source = `${uaPlatform} ${ua}`

  // Phones and tablets can't run a desktop wallet
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return { platform: null, arch: null }

  if (/Mac/i.test(source)) return { platform: 'mac', arch: 'universal' }
  if (/Win/i.test(source)) return { platform: 'windows', arch: 'x64' }
  if (/Linux|X11|CrOS/i.test(source)) {
    return { platform: 'linux', arch: /aarch64|arm64|armv8/i.test(ua) ? 'arm64' : 'x64' }
  }
  return { platform: null, arch: null }
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}
