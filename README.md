# ai-input-react

[![npm version](https://img.shields.io/npm/v/ai-input-react.svg)](https://www.npmjs.com/package/ai-input-react)
[![license](https://img.shields.io/npm/l/ai-input-react.svg)](https://github.com/Soptik1290/ai-input/blob/main/LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/ai-input-react.svg)](https://www.npmjs.com/package/ai-input-react)

**A React input component with AI text/voice support.** Unified text and audio input with real-time waveform visualization, designed for AI-powered applications.

## Why Use This?

- 🎤 **Unified Input** – Text and audio in a single component
- 🌊 **Real-time Waveform** – Audio visualization during recording  
- 🌓 **Auto Light/Dark Mode** – Adapts to system preference or `.dark` class
- 🎨 **Zero Config Styling** – Prepacked CSS, no Tailwind needed
- 🔌 **Headless Mode** – Full control with render props
- ⚡ **Framework Agnostic** – Next.js, Vite, Laravel, etc.

---

## Installation

```bash
# npm
npm install ai-input-react

# yarn
yarn add ai-input-react

# pnpm
pnpm add ai-input-react
```

---

## Quick Start

```tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

function App() {
  return (
    <AiInput
      send={async (input) => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({ message: input }),
        })
        return res.json()
      }}
      onSuccess={(result) => console.log('Response:', result)}
    />
  )
}
```

That's it! The component includes text input with a microphone button for audio recording.

---

## Framework Examples

<details>
<summary><strong>Next.js (App Router)</strong></summary>

```tsx
// app/page.tsx
'use client'

import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

export default function Home() {
  return (
    <AiInput
      send={async (input) => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({ message: input }),
        })
        return res.json()
      }}
    />
  )
}
```
</details>

<details>
<summary><strong>Laravel + Inertia</strong></summary>

```tsx
// resources/js/Pages/Chat.tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

export default function Chat({ csrfToken }: { csrfToken: string }) {
  return (
    <AiInput
      send={async (input) => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        })
        return res.json()
      }}
    />
  )
}
```
</details>

<details>
<summary><strong>Vite</strong></summary>

```tsx
// src/App.tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

export default function App() {
  return (
    <AiInput
      send={async (input) => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({ message: input }),
        })
        return res.json()
      }}
    />
  )
}
```
</details>

---

## GPT + Whisper Example

```tsx
<AiInput
  placeholder="Ask anything..."
  send={async (input) => {
    // Text → GPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: input as string }],
      }),
    })
    return response.json()
  }}
  sendAudio={async (blob) => {
    // Audio → Whisper
    const formData = new FormData()
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
    return response.json()
  }}
  onTranscription={(text) => console.log('Transcribed:', text)}
/>
```

---

## API Reference

### Props

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `send` | `(input: string \| Blob) => Promise<any>` | ✅ | Transport function for sending input |
| `sendAudio` | `(blob: Blob) => Promise<any>` | | Separate transport for audio (uses `send` if not provided) |
| `placeholder` | `string` | | Input placeholder text |
| `disabled` | `boolean` | | Disable the input |
| `className` | `string` | | Additional CSS classes |
| `rateLimit` | `{ cooldownMs, maxRequests, windowMs }` | | Rate limiting configuration |
| `audioConfig` | `{ maxDurationMs, mimeTypes }` | | Audio recording settings |
| `onSuccess` | `(result: any) => void` | | Called on successful response |
| `onError` | `(error: Error) => void` | | Called on error |
| `onTranscription` | `(text: string) => void` | | Called when audio is transcribed |
| `children` | `(props: RenderProps) => ReactNode` | | Render prop for headless usage |

### Render Props (Headless Mode)

```tsx
<AiInput send={sendFn}>
  {(props) => (
    // Full control over UI
  )}
</AiInput>
```

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | Current text value |
| `setText` | `(value: string) => void` | Update text |
| `submit` | `() => void` | Submit current input |
| `canSubmit` | `boolean` | Whether submit is allowed |
| `state` | `'idle' \| 'loading' \| 'success' \| 'error' \| 'recording'` | Current state |
| `isRecording` | `boolean` | Audio recording active |
| `startRecording` | `() => Promise<void>` | Start recording |
| `stopRecording` | `() => void` | Stop and send recording |
| `cancelRecording` | `() => void` | Discard recording |
| `audioLevels` | `number[]` | Waveform data (0-1) |
| `recordingDuration` | `number` | Recording time in ms |
| `error` | `Error \| null` | Current error |
| `reset` | `() => void` | Reset to idle state |

---

## Styling

### Prepacked CSS (Recommended)

```tsx
import 'ai-input-react/styles.css'
```

Includes dark theme with zinc/amber colors, waveform visualization, and smooth animations.

### Custom Styling (Tailwind)

If using Tailwind, don't import the CSS file. The component uses Tailwind utility classes that will be processed by your build.

### Light/Dark Mode

The component **automatically adapts** to your app's theme:

| Detection Method | Priority |
|-----------------|:--------:|
| `.dark` class on `<html>` | 1st |
| `data-theme="dark"` attribute | 2nd |
| `prefers-color-scheme` (system) | 3rd |

**For Tailwind/Next.js apps** – add a `.dark` class to `<html>`:

```tsx
// app/layout.tsx
'use client'
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', isDark)
    
    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        document.documentElement.classList.toggle('dark', e.matches)
      })
  }, [])

  return <html lang="en" suppressHydrationWarning>...</html>
}
```

**Without any config** – the component uses `prefers-color-scheme` automatically.

---

## Security

> ⚠️ **Never store API keys in frontend code!**

Use short-lived tokens from your backend:

```tsx
// ❌ Dangerous
const API_KEY = 'sk-...'

// ✅ Safe
const token = await getTokenFromBackend()
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 49+ |
| Firefox | 36+ |
| Safari | 14.1+ |
| Edge | 79+ |

Audio recording requires HTTPS (or localhost) and microphone permission.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Issues & Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/Soptik1290/ai-input/issues/new)
- 💡 **Feature Requests**: [Open an issue](https://github.com/Soptik1290/ai-input/issues/new)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Soptik1290/ai-input/discussions)

---

## License

[MIT](LICENSE) © 2024
