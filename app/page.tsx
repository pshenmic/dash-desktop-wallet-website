import { headers } from 'next/headers'
import { Badge, Accordion, DashLogo } from 'dash-ui-kit/react'
import { FeatureCarousel } from './FeatureCarousel'
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
  type Platform,
} from '@/lib/releases'

/* APT repo card temporarily hidden (2026-11-06) — uncomment together with its JSX in the Download section
const APT_COMMANDS = `curl -fsSL https://pshenmic.github.io/dash-desktop/key.asc \\
  | sudo gpg --dearmor -o /usr/share/keyrings/dash-desktop.gpg

echo "deb [signed-by=/usr/share/keyrings/dash-desktop.gpg] https://pshenmic.github.io/dash-desktop stable main" \\
  | sudo tee /etc/apt/sources.list.d/dash-desktop.list

sudo apt update && sudo apt install dash-desktop`
*/

/* Snap card temporarily hidden (2026-11-06) — uncomment together with its JSX in the Download section
const SNAP_COMMAND = 'sudo snap install dash-desktop-wallet'
*/

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Features', href: '#features' },
  { label: 'Download', href: '#download' },
  { label: 'Support', href: '#faq' },
  { label: 'GitHub', href: REPO_URL },
]

const INTRO_CARDS = [
  {
    icon: '/figma/introlayers.svg',
    title: 'Both layers, one seed',
    body: 'Send DASH, register an identity, top it up and withdraw back to L1 without switching apps.',
  },
  {
    icon: '/figma/intro-shield.svg',
    title: 'Private by choice',
    body: 'Move credits into the shielded pool and transact between shielded addresses.',
  },
  {
    icon: '/figma/intro-node.svg',
    title: 'Your node, if you want it',
    body: 'Start instantly through Dashscan, or switch to a built-in SPV client that syncs from the Dash P2P network.',
  },
]

const SECURITY_CARDS = [
  {
    title: 'Non-custodial',
    body: 'Private keys never leave your machine. Nobody else can move your funds.',
  },
  {
    title: 'Encrypted at rest',
    body: 'Recovery seed phrase is encrypted with your password using strong cryptographic algorithms.',
  },
  {
    title: 'P2P and SPV',
    body: 'With P2P mode your wallet data requests are done in the peer to peer network with Compact Filters that hides your wallet addresses from the others during sync.',
  },
  {
    title: 'No tracking',
    body: 'No accounts, analytics, ads or crash reporting by default.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'What Is Dash Desktop Wallet?',
    answer:
      'Dash Desktop Wallet is a non-custodial desktop application for the Dash network. It supports both Layer 1 (core payments) and Layer 2 (Dash Platform identities, DPNS, and credits), plus shielded Orchard transactions — all from a single recovery phrase.',
  },
  {
    question: 'Is Dash Desktop open source?',
    answer:
      'Yes, Dash Desktop Wallet is free and open source (MIT license). There are no fees for the wallet itself — only standard Dash network transaction fees apply.',
  },
  {
    question: 'Can I use Dash Platform (Dash Evolution) with Dash Desktop?',
    answer:
      'Yes. You can register identities, usernames, top up and transfer Platform credits and withdraw credits back to L1 — all from within the wallet.',
  },
  {
    question: 'Does it support shielded transactions?',
    answer:
      'Yes. Dash Desktop Wallet support private transactions in the Dash Evolution (L2) network. You can easily shield your funds and send privately between shielded addresses, and unshield back to regular Dash addresses.',
  },
  {
    question: 'Where can I get help or report a bug?',
    answer: 'You can submit a the GitHub issue or reach out to the Dash community forums. We\'re generally available in the Dash Discord.',
  },
  {
    question: 'Is Dash Desktop a non-custodial wallet?',
    answer:
      'Yes. Dash Desktop is designed to give you control over your wallet keys. Keep your recovery phrase secure and offline, as losing access to it may mean losing access to your funds.',
  },
]

const PLATFORM_NOTES: Record<Platform, string> = {
  mac: 'Universal build for Apple silicon and Intel. Signed and notarized.',
  windows: '64-bit installer for Windows 10 and 11.',
  linux: 'AppImage for x64 and arm64.',
}

const PLATFORM_ICONS: Record<Platform, string> = {
  mac: '/figma/icon-apple.svg',
  windows: '/figma/icon-windows.svg',
  linux: '/figma/icon-linux.svg',
}

function AssetList({ platform, downloads }: { platform: Platform; downloads: Download[] }) {
  const items = downloads.filter((d) => d.platform === platform)

  return (
    <div className={platform === 'linux' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
      {items.length === 0 ? (
        <a href={LATEST_URL} className="download-asset">
          <span className="text-[15px]">Download</span>
        </a>
      ) : (
        items.map((d) => (
          <a key={d.name} href={d.url} className="download-asset" target="_blank" rel="noopener">
            <span className="text-[15px]">{d.label}</span>
            <span className="text-[13px] font-normal text-[color:var(--color-muted)]">
              {ARCH_NAMES[d.arch]} · {formatSize(d.size)}
            </span>
          </a>
        ))
      )}
    </div>
  )
}

export default async function Home() {
  const requestHeaders = await headers()
  const { platform, arch } = detectPlatform(
    requestHeaders.get('user-agent') ?? '',
    requestHeaders.get('sec-ch-ua-platform') ?? '',
  )

  const release = await getLatestRelease()
  // .deb and .snap packages temporarily hidden (2026-11-06) together with the APT and Snap cards
  const downloads = (release?.downloads ?? []).filter((d) => d.kind !== 'deb' && d.kind !== 'snap')
  const primary = platform ? pickPrimary(downloads, platform, arch) : null

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <div className="flex items-center gap-24">
            <a href="#top" className="flex items-center gap-2 text-[color:var(--color-text)]">
              <DashLogo width={30} height={24} />
              <span className="text-[12px] font-extrabold leading-none tracking-[-0.03em]">
                Dash
                Desktop
                <br />
                Wallet
              </span>
            </a>
            <nav className="nav-links">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} aria-current={link.href === '#top' ? 'page' : undefined}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="pt-16 pb-16 lg:pb-24">
          <div className="max-w-[1344px] mx-auto px-12 grid lg:grid-cols-2 gap-10 items-start">
            <div className="lg:pt-[68px]">
              <h1 className="text-[48px] leading-none font-medium tracking-[-0.03em] text-[color:var(--color-text)]">
                <strong className="font-bold">Dash Desktop Wallet</strong>
              </h1>
              <p className="mt-5 max-w-[520px] text-[20px] font-medium leading-relaxed tracking-[-0.03em] text-[color:var(--color-muted)]">
                Your gateway to the Dash network. Instant payments, private transactions and DashPay - all private by design.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <a className="btn-brand" href={primary?.url ?? LATEST_URL}>
                  {primary && platform ? `Download for ${PLATFORM_NAMES[platform]}` : 'Download'}
                </a>
                <a className="btn-ghost" href="#download">
                  Other platforms
                </a>
              </div>

              <p className="mt-3 text-[14px] font-medium tracking-[-0.03em] text-[color:var(--color-muted)]">
                {primary && release
                  ? `${release.tag}${release.prerelease ? ' (pre-release)' : ''} · ${primary.label} · ${formatSize(primary.size)}`
                  : release
                    ? `${release.tag}${release.prerelease ? ' (pre-release)' : ''} · macOS · Windows · Linux`
                    : 'macOS · Windows · Linux · Free and open source (MIT)'}
              </p>
            </div>

            <div className="relative">
              <img
                src="/figma/hero-art.png"
                alt="Dash Desktop Wallet dashboard"
                className="w-full max-w-[525px] mx-auto lg:ml-auto"
              />
            </div>
          </div>
        </section>

        {/* Intro cards */}
        <section className="pb-16">
          <div className="max-w-[1344px] mx-auto px-12 grid md:grid-cols-3 gap-4">
            {INTRO_CARDS.map((card) => (
              <div key={card.title} className="intro-card">
                <span className="icon-square mb-6">
                  <img src={card.icon} alt="" aria-hidden />
                </span>
                <h3 className="text-[20px] font-semibold tracking-[-0.03em] mb-2">
                  {card.title}
                </h3>
                <p className="text-[18px] font-medium leading-relaxed text-[color:var(--color-muted)]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16">
          <div className="max-w-[1344px] mx-auto px-12">
            <FeatureCarousel />
          </div>
        </section>

        {/* Security */}
        <section className="py-16">
          <div className="max-w-[1344px] mx-auto px-12 grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="eyebrow">Most Important</div>
              <h2 className="text-[32px] font-semibold tracking-[-0.03em] mb-8">
                Security &amp; Privacy
              </h2>

              <div className="security-cols">
                {SECURITY_CARDS.map((card) => (
                  <div key={card.title} className="security-card flex flex-col">
                    <h4 className="text-[20px] font-semibold tracking-[-0.03em] mb-3">
                      {card.title}
                    </h4>
                    <p className="text-[18px] font-medium leading-relaxed text-[color:var(--color-muted)]">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="security-shot">
              <img src="/figma/security-wallet.png" alt="Dash Desktop Wallet transactions screen" />
            </div>
          </div>
        </section>

        {/* Download */}
        <section id="download" className="py-16">
          <div className="max-w-[1344px] mx-auto px-12">
            <h2 className="text-[32px] font-semibold tracking-[-0.03em] mb-1">
              Download
            </h2>

            <div className="flex flex-wrap items-center gap-3 mb-8 text-[18px] font-medium tracking-[-0.03em] text-[color:var(--color-muted)]">
              {release ? (
                <>
                  <span>{release.tag}</span>
                  {release.prerelease && (
                    <span className="rounded-full px-4 py-2 text-[14px] font-semibold tracking-normal text-[#FF8B4C] bg-[rgba(255,139,76,0.12)]">
                      Pre-release
                    </span>
                  )}
                  <span>released {formatDate(release.publishedAt)}</span>
                  <a href={release.url} className="text-[color:var(--color-brand)]">
                    Release notes
                  </a>
                </>
              ) : (
                <>
                  Get the latest version from{' '}
                  <a href={LATEST_URL} className="text-[color:var(--color-brand)]">
                    GitHub Releases
                  </a>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {PLATFORMS.map((p) => (
                <div key={p} className={`download-card${p === platform ? ' is-current' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="icon-square">
                      <img src={PLATFORM_ICONS[p]} alt="" aria-hidden />
                    </span>
                    <h3 className="text-[24px] font-semibold tracking-[-0.03em]">
                      {PLATFORM_NAMES[p]}
                    </h3>
                    {p === platform && (
                      <Badge color="blue" className="text-xs">
                        Your Platform
                      </Badge>
                    )}
                  </div>
                  <p className="text-[18px] font-medium text-[color:var(--color-muted)] mb-5">
                    {PLATFORM_NOTES[p]}
                  </p>
                  <AssetList platform={p} downloads={downloads} />
                  {p === 'windows' && (
                    <p className="mt-4 text-[14px] font-medium text-[color:var(--color-muted)]">
                      The installer is not code-signed yet. SmartScreen may warn — choose{' '}
                      <em>More info → Run anyway</em>.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* APT repo card temporarily hidden (2026-11-06) — restore it and the lg:grid-cols-[1.1fr_1fr] wrapper together
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 mt-4">
              <div className="download-card min-w-0">
                <h4 className="text-[20px] font-semibold tracking-[-0.03em] mb-2">
                  Debian / Ubuntu: APT repository{' '}
                  <Badge color="blue" className="text-xs align-middle">
                    Recommended
                  </Badge>
                </h4>
                <p className="text-[18px] font-medium text-[color:var(--color-muted)] mb-4">
                  Signed, and updates with the rest of your system.
                </p>
                <div className="code-block">
                  <CopyButton text={APT_COMMANDS} />
                  <pre>
                    <code>{APT_COMMANDS}</code>
                  </pre>
                </div>
              </div>
            */}

            {/* Snap card temporarily hidden (2026-11-06) — restore it with the APT card above into one lg:grid-cols-[1.1fr_1fr] wrapper, and re-add the CopyButton import
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="download-card min-w-0">
                <h4 className="text-[20px] font-semibold tracking-[-0.03em] mb-2">
                  Snap
                </h4>
                <p className="text-[18px] font-medium text-[color:var(--color-muted)] mb-4">
                  Available on the{' '}
                  <a href="https://snapcraft.io/dash-desktop-wallet" className="text-[color:var(--color-brand)]">
                    Snap Store
                  </a>
                  .
                </p>
                <div className="code-block">
                  <CopyButton text={SNAP_COMMAND} />
                  <pre>
                    <code>{SNAP_COMMAND}</code>
                  </pre>
                </div>
              </div>
            </div>
            */}

            <p className="mt-10 text-[18px] font-medium text-[color:var(--color-muted)] text-center">
              Looking for an older version or a pre-release? See{' '}
              <a href={RELEASES_URL} className="text-[color:var(--color-brand)]">
                all releases
              </a>
              . Prefer to build it yourself? Follow the{' '}
              <a href={`${REPO_URL}#build-from-source`} className="text-[color:var(--color-brand)]">
                build instructions
              </a>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16">
          <div className="max-w-[1344px] mx-auto px-12">
            <div className="eyebrow">Help &amp; FAQ</div>
            <h2 className="text-[32px] font-semibold tracking-[-0.03em] mb-8">
              We Believe in Security and Privacy
            </h2>

            <div className="grid md:grid-cols-2 gap-4 items-start">
              {FAQ_ITEMS.map((item) => (
                <Accordion key={item.question} title={item.question} className="faq-item">
                  <p className="text-[18px] font-medium leading-relaxed text-[color:var(--color-muted)]">{item.answer}</p>
                </Accordion>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pb-6">
        <div className="max-w-[1344px] mx-auto px-12">
          <div className="footer-pill">
            <a href="#top" className="flex items-center">
              <img src="/figma/footer-logo.svg" alt="Dash" className="h-7 w-auto" />
            </a>
            <nav className="flex flex-wrap items-center gap-7 text-sm">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="font-semibold text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="px-2 mt-4 text-[13px] text-[color:var(--color-muted)]">
            <span>©2026 Dash Desktop Wallet</span>
          </div>
        </div>
      </footer>
    </>
  )
}
