# ai-input-react

A React component for text/audio input with AI API integration. Framework-agnostic – works with Next.js, Vite, Laravel, and any React setup.

## Features

- 🎤 **Unified Input** – Text and audio in a single component
- 🌊 **Real-time Waveform** – Audio visualization during recording
- 🎨 **Prepacked CSS** – Works out of the box, no Tailwind needed
- 🔌 **Headless Mode** – Full control with render props
- ⚡ **Framework Agnostic** – Next.js, Vite, Laravel, etc.

---

## Quick Start (Next.js)

```bash
npx create-next-app@latest my-app
cd my-app
npm install ai-input-react
```

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
      onSuccess={(result) => console.log('Response:', result)}
    />
  )
}
```

---

## Quick Start (Laravel + Inertia)

```bash
# In your Laravel project
npm install ai-input-react
```

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
      onSuccess={(result) => console.log('Response:', result)}
    />
  )
}
```

---

## Quick Start (Vite)

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install ai-input-react
```

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

---

## Prepacked CSS

The package includes **prepacked CSS** that works immediately without any configuration.

```tsx
import 'ai-input-react/styles.css'
```

### What's Included

- Unified input design (text + audio)
- Real-time waveform visualization
- Dark theme (zinc base, amber accent)
- Smooth animations and transitions

### Benefits

- ✅ No Tailwind configuration needed
- ✅ No shadcn/ui dependency
- ✅ Works in any React application
- ✅ ~10KB minified

---

## Example: GPT + Whisper

```tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

function ChatInput({ token }: { token: string }) {
  return (
    <AiInput
      placeholder="Ask anything..."
      send={async (input) => {
        // Text input → GPT
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
        // Audio input → Whisper
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
      onSuccess={(result) => console.log('Response:', result)}
    />
  )
}
```

---

## Headless Mode (Custom UI)

Use render props for full control over the UI:

```tsx
import { AiInput } from 'ai-input-react'

function CustomUI() {
  return (
    <AiInput send={sendFn}>
      {({ text, setText, submit, state, isRecording, audioLevels, startRecording, stopRecording }) => (
        <div className="your-custom-styles">
          {isRecording ? (
            <MyWaveform levels={audioLevels} />
          ) : (
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
          )}
          <button onClick={isRecording ? stopRecording : submit}>
            {state === 'loading' ? 'Sending...' : isRecording ? 'Stop' : 'Send'}
          </button>
          <button onClick={startRecording}>🎤</button>
        </div>
      )}
    </AiInput>
  )
}
```

---

## Using Hooks Separately

```tsx
import { useAiInput, useAudioRecorder, useRateLimiter } from 'ai-input-react'

function CustomComponent() {
  const aiInput = useAiInput({
    send: async (input) => { /* ... */ },
    rateLimit: { cooldownMs: 1000 },
  })

  // Audio recorder only
  const recorder = useAudioRecorder({
    maxDurationMs: 60000,
    onRecordingComplete: (blob) => console.log('Recording complete:', blob),
  })

  // Rate limiter only
  const rateLimiter = useRateLimiter({
    cooldownMs: 500,
    maxRequests: 10,
    windowMs: 60000,
  })
}
```

---

## API Reference

### `<AiInput />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `send` | `(input: string \| Blob) => Promise<any>` | required | Transport function for text |
| `sendAudio` | `(blob: Blob) => Promise<any>` | - | Optional transport for audio |
| `rateLimit` | `RateLimitConfig` | `{ cooldownMs: 1000, ... }` | Rate limiting config |
| `audioConfig` | `AudioConfig` | `{ maxDurationMs: 60000, ... }` | Audio settings |
| `onSuccess` | `(result: any) => void` | - | Success callback |
| `onError` | `(error: Error) => void` | - | Error callback |
| `onTranscription` | `(text: string) => void` | - | Audio transcription callback |
| `children` | `(props: AiInputRenderProps) => ReactNode` | - | Headless render prop |
| `placeholder` | `string` | `'Ask anything...'` | Input placeholder |
| `className` | `string` | - | CSS classes for container |
| `disabled` | `boolean` | `false` | Disable input |

### `AiInputRenderProps`

When using render props (`children`), you get:

```typescript
interface AiInputRenderProps {
  state: 'idle' | 'loading' | 'success' | 'error' | 'rate-limited' | 'recording'
  error: Error | null
  result: unknown
  
  // Text
  text: string
  setText: (value: string) => void
  submit: () => void
  canSubmit: boolean
  
  // Audio
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  cancelRecording: () => void
  recordingDuration: number
  maxRecordingDuration: number
  audioLevels: number[]
  
  // Rate limiting
  cooldownRemaining: number
  requestsRemaining: number
  
  reset: () => void
}
```

---

## ⚠️ Security Warning

> **Never store secret API keys in frontend code!**

This package is designed for browser-side use where tokens are provided by the host application.

### Recommended Approach

1. **Short-lived tokens**: Generate tokens with limited validity on your backend
2. **Proxy API**: Create an API route that adds authentication
3. **Session-based auth**: Use session cookies for verification

```tsx
// ❌ WRONG
const API_KEY = 'sk-...' // DANGEROUS!

// ✅ CORRECT
const token = await getTokenFromBackend()
```

---

## Browser Support

- Chrome 49+
- Firefox 36+
- Safari 14.1+
- Edge 79+

Audio recording requires:
- `MediaRecorder` API support
- Web Audio API for waveform
- Microphone access (HTTPS or localhost)

---

## License

MIT
