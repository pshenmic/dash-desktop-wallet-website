'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

function payloadOf(el: Element): Record<string, string> | undefined {
  const raw = el.getAttribute('data-event-payload')
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return undefined
  }
}

// Click delegation so server-rendered markup can declare events via data-event attributes
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest) return

      const link = target.closest('a[data-event]')
      if (link) {
        track(link.getAttribute('data-event') as string, payloadOf(link))
        return
      }

      const faqTrigger = target.closest('.faq-item button')
      if (faqTrigger) {
        const wasOpen = faqTrigger.getAttribute('aria-expanded') === 'true'
        track('faq_toggle', {
          question: (faqTrigger.textContent || '').trim(),
          action: wasOpen ? 'close' : 'open',
        })
        return
      }

      if (target.closest('footer')) {
        const footerLink = target.closest('a')
        track('footer_click', {
          label: footerLink ? (footerLink.textContent || '').trim() || 'logo' : (target.textContent || '').trim().slice(0, 40) || 'unknown',
          href: footerLink?.getAttribute('href') ?? '',
        })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
