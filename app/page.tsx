import { headers } from 'next/headers'
import { CopyButton } from './CopyButton'
import {
  ARCH_NAMES,
  LATEST_URL,
  PLATFORM_NAMES,
  PLATFORMS,
  RELEASES_URL,
  REPO_URL,
  detectPlatform,
  formatDate,
  formatSize,
  getLatestRelease,
  pickPrimary,
  type Download,
  type Platform
} from '@/lib/releases'

const APT_COMMANDS = `curl -fsSL https://pshenmic.github.io/dash-desktop/key.asc \\
  | sudo gpg --dearmor -o /usr/share/keyrings/dash-desktop.gpg

echo "deb [signed-by=/usr/share/keyrings/dash-desktop.gpg] https://pshenmic.github.io/dash-desktop stable main" \\
  | sudo tee /etc/apt/sources.list.d/dash-desktop.list

sudo apt update && sudo apt install dash-desktop`

const SNAP_COMMAND = 'sudo snap install dash-desktop-wallet'

// Shown before release data loads or if GitHub is unreachable
const FALLBACK_LINK: Record<Platform, string> = {
  mac: 'Download .dmg',
  windows: 'Download .exe',
  linux: 'Download from GitHub'
}

const PLATFORM_NOTES: Record<Platform, string> = {
  mac: 'Universal build for Apple silicon and Intel. Signed and notarized.',
  windows: '64-bit installer for Windows 10 and 11.',
  linux: 'AppImage, .deb and Snap for x64 and arm64.'
}

function AssetList({ platform, downloads }: { platform: Platform; downloads: Download[] }) {
  const items = downloads.filter((d) => d.platform === platform)

  return (
    <ul className="assets">
      {items.length === 0 ? (
        <li>
          <a href={LATEST_URL}>{FALLBACK_LINK[platform]}</a>
        </li>
      ) : (
        items.map((d) => (
          <li key={d.name}>
            <a href={d.url}>
              <span className="asset-label">{d.label}</span>
              <span className="asset-meta">
                {ARCH_NAMES[d.arch]} · {formatSize(d.size)}
              </span>
            </a>
          </li>
        ))
      )}
    </ul>
  )
}

export default async function Home() {
  const requestHeaders = await headers()
  const { platform, arch } = detectPlatform(
    requestHeaders.get('user-agent') ?? '',
    requestHeaders.get('sec-ch-ua-platform') ?? ''
  )

  const release = await getLatestRelease()
  const downloads = release?.downloads ?? []
  const primary = platform ? pickPrimary(downloads, platform, arch) : null

  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top">
            <img src="/icon.png" alt="" width={28} height={28} />
            <span>Dash Desktop</span>
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#download">Download</a>
            <a href={REPO_URL} className="nav-gh">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-inner">
            <img className="hero-icon" src="/icon.png" alt="Dash Desktop Wallet icon" width={112} height={112} />
            <h1>Dash Desktop Wallet</h1>
            <p className="lede">
              Desktop wallet app supporting both layers of <a href="https://dash.org">Dash</a> network. Core payments,
              Platform identities and shielded transactions in a single desktop app, built on one recovery phrase. Your
              keys never leave your computer.
            </p>

            <div className="cta">
              <a className="btn btn-primary" href={primary?.url ?? LATEST_URL}>
                {primary && platform ? `Download for ${PLATFORM_NAMES[platform]}` : 'Download'}
              </a>
              <a className="btn btn-ghost" href="#download">
                All platforms
              </a>
            </div>
            <p className="meta">
              {primary && release
                ? `${release.tag}${release.prerelease ? ' (pre-release)' : ''} · ${primary.label} · ${formatSize(primary.size)}`
                : 'macOS · Windows · Linux  ·  Free and open source (MIT)'}
            </p>
          </div>
        </section>

        <section className="pillars">
          <div className="wrap pillars-grid">
            <div className="pillar">
              <h3>Both layers, one seed</h3>
              <p>Send DASH, register an identity, top it up and withdraw back to L1 without switching apps.</p>
            </div>
            <div className="pillar">
              <h3>Private by choice</h3>
              <p>Move credits into the shielded pool and transact between shielded addresses.</p>
            </div>
            <div className="pillar">
              <h3>Your node, if you want it</h3>
              <p>
                Start instantly through Dashscan, or switch to a built-in SPV client that syncs from the Dash P2P network.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="wrap">
            <h2>Features</h2>
            <div className="features">
              <article className="feature">
                <span className="tag">L1</span>
                <h3>Dash Core</h3>
                <ul>
                  <li>Send DASH with fee preview and coin control</li>
                  <li>InstantSend and ChainLock status on every transaction</li>
                  <li>Full history with incoming and outgoing detection</li>
                  <li>Receive with QR code, label any address</li>
                  <li>Contacts for the people you pay often</li>
                </ul>
              </article>
              <article className="feature">
                <span className="tag">L2</span>
                <h3>Dash Platform</h3>
                <ul>
                  <li>Register identities, funded from L1 or Platform addresses</li>
                  <li>Top up, transfer and withdraw credits back to L1</li>
                  <li>
                    DPNS usernames like <code>alice.dash</code> resolved automatically
                  </li>
                  <li>Platform addresses for direct credit transfers</li>
                </ul>
              </article>
              <article className="feature">
                <span className="tag">Privacy</span>
                <h3>Shielded transactions</h3>
                <ul>
                  <li>Shield credits into the Orchard pool</li>
                  <li>Send privately between shielded addresses</li>
                  <li>Unshield or withdraw back out when you need to</li>
                </ul>
              </article>
              <article className="feature">
                <span className="tag">Network</span>
                <h3>Connect your way</h3>
                <ul>
                  <li>Mainnet and testnet</li>
                  <li>Dashscan mode: instant start, no sync</li>
                  <li>P2P mode: SPV sync with BIP157/158 compact filters</li>
                  <li>Manage peers, DNS seeds and fee multipliers</li>
                </ul>
              </article>
              <article className="feature feature-wide">
                <span className="tag">Wallets</span>
                <h3>As many wallets as you need</h3>
                <p>
                  Create or import BIP39 wallets, keep several and switch at any time, export your recovery phrase,
                  change a wallet&apos;s password, and see balances in USD, EUR, BTC or RUB.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="security" className="section section-alt">
          <div className="wrap">
            <h2>Security &amp; privacy</h2>
            <div className="security">
              <div>
                <h3>Non-custodial</h3>
                <p>Keys are derived on your machine. Nobody else can move your funds.</p>
              </div>
              <div>
                <h3>Encrypted at rest</h3>
                <p>
                  Your recovery phrase is encrypted with AES-256-GCM using a key derived from your password with
                  PBKDF2-SHA-512.
                </p>
              </div>
              <div>
                <h3>No tracking</h3>
                <p>No accounts, analytics, ads or crash reporting.</p>
              </div>
              <div>
                <h3>Verified sync</h3>
                <p>
                  In P2P mode, headers are checked against difficulty rules and blocks against their merkle roots before
                  anything is trusted.
                </p>
              </div>
            </div>
            <p className="callout">
              <strong>Write down your recovery phrase and keep it offline.</strong> It is the only way to restore your
              wallet. Nobody, including the developers, can recover it for you.
            </p>
          </div>
        </section>

        <section id="download" className="section">
          <div className="wrap">
            <h2>Download</h2>
            <p className="section-sub">
              {release ? (
                <>
                  <span className="version">{release.tag}</span>
                  {release.prerelease && <span className="pill pill-warn">Pre-release</span>} released{' '}
                  {formatDate(release.publishedAt)} · <a href={release.url}>Release notes</a>
                </>
              ) : (
                <>
                  Get the latest version from <a href={LATEST_URL}>GitHub Releases</a>.
                </>
              )}
            </p>

            <div className="platforms">
              {PLATFORMS.map((p) => (
                <article key={p} className={`platform${p === platform ? ' is-current' : ''}`}>
                  <h3>{PLATFORM_NAMES[p]}</h3>
                  <p className="platform-note">{PLATFORM_NOTES[p]}</p>
                  <AssetList platform={p} downloads={downloads} />
                  {p === 'windows' && (
                    <p className="hint">
                      The installer is not code-signed yet, so SmartScreen may warn on first launch. Choose{' '}
                      <em>More info → Run anyway</em>.
                    </p>
                  )}
                </article>
              ))}
            </div>

            <div className="linux-install">
              <div className="install-block">
                <h3>
                  Debian / Ubuntu: APT repository <span className="pill">Recommended</span>
                </h3>
                <p>Signed, and updates with the rest of your system.</p>
                <div className="code">
                  <CopyButton text={APT_COMMANDS} />
                  <pre>
                    <code>{APT_COMMANDS}</code>
                  </pre>
                </div>
              </div>
              <div className="install-block">
                <h3>Snap</h3>
                <p>
                  Available on the <a href="https://snapcraft.io/dash-desktop-wallet">Snap Store</a>.
                </p>
                <div className="code">
                  <CopyButton text={SNAP_COMMAND} />
                  <pre>
                    <code>{SNAP_COMMAND}</code>
                  </pre>
                </div>
              </div>
            </div>

            <p className="section-foot">
              Looking for an older version or a pre-release? See <a href={RELEASES_URL}>all releases</a>. Prefer to build
              it yourself? Follow the <a href={`${REPO_URL}#build-from-source`}>build instructions</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <span>MIT © pshenmic</span>
          <nav>
            <a href={REPO_URL}>Source</a>
            <a href={`${REPO_URL}/blob/master/PRIVACY.md`}>Privacy policy</a>
            <a href={`${REPO_URL}/issues`}>Report an issue</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
