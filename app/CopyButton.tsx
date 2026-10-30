'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState('Copy')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setLabel('Copied')
    } catch {
      setLabel('Press ⌘/Ctrl+C')
    }
    setTimeout(() => setLabel('Copy'), 1600)
  }

  return (
    <button className="copy" type="button" aria-label="Copy commands" onClick={copy}>
      {label}
    </button>
  )
}
