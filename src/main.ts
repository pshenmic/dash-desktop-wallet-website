import './style.css'
import {
  detectPlatform,
  fetchLatestRelease,
  formatSize,
  toDownloads,
  type Download,
  type GithubRelease,
  type Platform
} from './releases'

const PLATFORM_NAMES: Record<Platform, string> = {
  mac: 'macOS',
  windows: 'Windows',
  linux: 'Linux'
}

const ARCH_NAMES: Record<Download['arch'], string> = {
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

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

function renderAssetList(platform: Platform, downloads: Download[]) {
  const list = document.querySelector<HTMLUListElement>(`[data-assets="${platform}"]`)
  const items = downloads.filter((d) => d.platform === platform)
  if (!list || items.length === 0) return

  list.replaceChildren(
    ...items.map((d) => {
      const li = el('li')
      const a = el('a', 'asset')
      a.href = d.url
      a.append(el('span', 'asset-label', d.label), el('span', 'asset-meta', `${ARCH_NAMES[d.arch]} · ${formatSize(d.size)}`))
      li.append(a)
      return li
    })
  )
}

function renderPrimary(release: GithubRelease, downloads: Download[]) {
  const { platform, arch } = detectPlatform()
  if (!platform) return

  const candidates = downloads.filter((d) => d.platform === platform && d.kind === PRIMARY_KIND[platform])
  const pick = candidates.find((d) => d.arch === arch) ?? candidates[0]
  if (!pick) return

  const button = document.getElementById('primary-download') as HTMLAnchorElement
  document.getElementById('primary-label')!.textContent = `Download for ${PLATFORM_NAMES[platform]}`
  button.href = pick.url

  document.querySelector(`[data-platform="${platform}"]`)?.classList.add('is-current')

  const meta = document.getElementById('release-meta')!
  meta.textContent = `${release.tag_name}${release.prerelease ? ' (pre-release)' : ''} · ${pick.label} · ${formatSize(pick.size)}`
}

function renderVersion(release: GithubRelease) {
  const target = document.getElementById('download-version')!
  const date = new Date(release.published_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const link = el('a', undefined, 'Release notes')
  link.href = release.html_url

  target.replaceChildren(
    el('span', 'version', release.tag_name),
    ...(release.prerelease ? [el('span', 'pill pill-warn', 'Pre-release')] : []),
    document.createTextNode(` released ${date} · `),
    link
  )
}

function setupCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('.code .copy').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = button.parentElement?.querySelector('code')?.textContent ?? ''
      try {
        await navigator.clipboard.writeText(code)
        button.textContent = 'Copied'
      } catch {
        button.textContent = 'Press ⌘/Ctrl+C'
      }
      setTimeout(() => (button.textContent = 'Copy'), 1600)
    })
  })
}

async function init() {
  setupCopyButtons()

  // If the API is unreachable or rate limited, the static links to
  // GitHub Releases already in the HTML keep working.
  try {
    const release = await fetchLatestRelease()
    const downloads = toDownloads(release)
    ;(['mac', 'windows', 'linux'] as Platform[]).forEach((p) => renderAssetList(p, downloads))
    renderPrimary(release, downloads)
    renderVersion(release)
  } catch (err) {
    console.warn('Could not load release info:', err)
  }
}

init()
