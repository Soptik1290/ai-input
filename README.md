# ai-input-react

Publikovatelný React balíček pro text/audio vstup s AI API integrací. Framework-agnostický, funguje s Next.js, Vite, PHP a jakýmkoli React setupem.

## Instalace

```bash
npm install ai-input-react
```

## Požadavky

Hostitelský projekt musí mít:

1. **React 19+** (kompatibilní i s React 18)
2. **Tailwind CSS 4+** nakonfigurovaný
3. **shadcn/ui** inicializovaný s tímto presetem:

```bash
npx shadcn@latest init \
  --preset "https://ui.shadcn.com/init?base=radix&style=maia&baseColor=zinc&theme=amber&iconLibrary=phosphor&font=inter&menuAccent=bold&menuColor=default&radius=small&template=next"
```

> ⚠️ Komponenta používá Tailwind utility classes odpovídající tomuto presetu (zinc base, amber theme, small radius).

## Základní použití

```tsx
import { AiInput } from 'ai-input-react'

function ChatComponent() {
  const handleSend = async (input: string | Blob) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yourToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    })
    return response.json()
  }

  return (
    <AiInput
      mode="text"
      send={handleSend}
      onSuccess={(result) => console.log('Response:', result)}
      onError={(error) => console.error('Error:', error)}
    />
  )
}
```

## Next.js Integrace

### Pages Router

```tsx
// pages/chat.tsx
import { AiInput } from 'ai-input-react'

export default function ChatPage() {
  return (
    <AiInput
      mode="text"
      send={async (input) => {
        // Volání vašeho API route
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

### App Router

```tsx
// app/chat/page.tsx
'use client'

import { AiInput } from 'ai-input-react'

export default function ChatPage() {
  return (
    <AiInput
      mode="text"
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

## Příklad: GPT-5-mini (Text)

```tsx
import { AiInput } from 'ai-input-react'

function GPT5Input() {
  // Token získaný z vašeho backendu (NE hardcodovaný!)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Získejte krátkodobý token z vašeho API
    fetch('/api/auth/token').then(res => res.json()).then(data => {
      setToken(data.token)
    })
  }, [])

  if (!token) return <div>Loading...</div>

  return (
    <AiInput
      mode="text"
      placeholder="Zeptejte se GPT-5-mini..."
      submitLabel="Odeslat"
      send={async (input) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-mini',
            messages: [{ role: 'user', content: input as string }],
          }),
        })
        return response.json()
      }}
      onSuccess={(result) => {
        console.log('GPT Response:', result)
      }}
      rateLimit={{
        cooldownMs: 2000,
        maxRequests: 5,
        windowMs: 60000,
      }}
    />
  )
}
```

## Příklad: Whisper API (Audio)

```tsx
import { AiInput } from 'ai-input-react'

function WhisperInput() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/token').then(res => res.json()).then(data => {
      setToken(data.token)
    })
  }, [])

  if (!token) return <div>Loading...</div>

  return (
    <AiInput
      mode="audio"
      recordLabel="Nahrát"
      stopLabel="Stop"
      audioConfig={{
        maxDurationMs: 30000, // Max 30 sekund
        mimeTypes: ['audio/webm', 'audio/mp4'],
      }}
      send={async (input) => {
        const formData = new FormData()
        formData.append('file', input as Blob, 'audio.webm')
        formData.append('model', 'whisper-1')
        formData.append('language', 'cs')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })
        return response.json()
      }}
      onSuccess={(result) => {
        console.log('Transkripce:', result)
      }}
    />
  )
}
```

## Headless API (Vlastní UI)

Pro úplnou kontrolu nad UI použijte render prop pattern:

```tsx
import { AiInput } from 'ai-input-react'

function CustomUI() {
  return (
    <AiInput mode="text" send={sendFn}>
      {({
        text,
        setText,
        submit,
        state,
        error,
        isRecording,
        startRecording,
        stopRecording,
        recordingDuration,
        cooldownRemaining,
        requestsRemaining,
      }) => (
        <div className="my-custom-component">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="my-input"
          />
          
          <button
            onClick={submit}
            disabled={state === 'loading' || !text.trim()}
            className="my-button"
          >
            {state === 'loading' ? 'Odesílám...' : 'Odeslat'}
          </button>
          
          {error && <p className="error">{error.message}</p>}
          
          {cooldownRemaining > 0 && (
            <p>Počkejte {Math.ceil(cooldownRemaining / 1000)}s</p>
          )}
        </div>
      )}
    </AiInput>
  )
}
```

## Použití hooků samostatně

```tsx
import { useAiInput, useAudioRecorder, useRateLimiter } from 'ai-input-react'

function CustomComponent() {
  const aiInput = useAiInput({
    mode: 'text',
    send: async (input) => { /* ... */ },
    rateLimit: { cooldownMs: 1000 },
  })

  // Nebo pouze audio recorder
  const recorder = useAudioRecorder({
    maxDurationMs: 60000,
    onRecordingComplete: (blob) => {
      console.log('Recording complete:', blob)
    },
  })

  // Nebo pouze rate limiter
  const rateLimiter = useRateLimiter({
    cooldownMs: 500,
    maxRequests: 10,
    windowMs: 60000,
  })
}
```

## API Reference

### `<AiInput />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'text' \| 'audio'` | required | Režim vstupu |
| `send` | `(input: string \| Blob) => Promise<any>` | required | Transport funkce |
| `rateLimit` | `RateLimitConfig` | `{ cooldownMs: 1000, maxRequests: 10, windowMs: 60000 }` | Rate limiting |
| `audioConfig` | `AudioConfig` | `{ maxDurationMs: 60000, mimeTypes: [...] }` | Audio nastavení |
| `onSuccess` | `(result: any) => void` | - | Callback při úspěchu |
| `onError` | `(error: Error) => void` | - | Callback při chybě |
| `children` | `(props: AiInputRenderProps) => ReactNode` | - | Headless render prop |
| `placeholder` | `string` | `'Type your message...'` | Placeholder (text mode) |
| `submitLabel` | `string` | `'Send'` | Label tlačítka (text mode) |
| `recordLabel` | `string` | `'Record'` | Label tlačítka (audio mode) |
| `stopLabel` | `string` | `'Stop'` | Label stop tlačítka (audio mode) |
| `disabled` | `boolean` | `false` | Zakázat vstup |
| `className` | `string` | - | CSS třídy pro container |

### `AiInputRenderProps`

Při použití render prop (`children`) získáte tyto props:

```typescript
interface AiInputRenderProps {
  state: 'idle' | 'loading' | 'success' | 'error' | 'rate-limited' | 'recording'
  error: Error | null
  result: unknown
  
  // Text mode
  text: string
  setText: (value: string) => void
  submit: () => void
  canSubmit: boolean
  
  // Audio mode
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  recordingDuration: number
  maxRecordingDuration: number
  
  // Rate limiting
  cooldownRemaining: number
  requestsRemaining: number
  
  reset: () => void
}
```

## ⚠️ Bezpečnostní upozornění

> **NIKDY neukládejte tajné API klíče ve frontendovém kódu!**

Tento balíček je navržen pro browser-side použití, kde jsou tokeny poskytnuty z hostitelské aplikace.

### Doporučený přístup:

1. **Krátkodobé tokeny**: Generujte tokeny s omezenou platností na vašem backendu
2. **Proxy API**: Vytvořte API route ve vaší aplikaci, která přidá autentizaci
3. **Session-based auth**: Použijte session cookies pro ověření

```tsx
// ❌ ŠPATNĚ - nikdy nedělejte
const API_KEY = 'sk-...' // NEBEZPEČNÉ!

// ✅ SPRÁVNĚ - token z backendu
const token = await getTokenFromBackend()
```

## Podpora prohlížečů

- Chrome 49+
- Firefox 36+
- Safari 14.1+
- Edge 79+

Audio nahrávání vyžaduje:
- Podporu `MediaRecorder` API
- Přístup k mikrofonu (HTTPS nebo localhost)

## Použití mimo Next.js

Balíček je framework-agnostický a funguje v jakékoli React aplikaci:

- **Vite**: Přímo použitelný
- **Create React App**: Přímo použitelný
- **PHP/Laravel**: Použijte jako standalone React component
- **Inertia.js**: Použijte v React pages

```jsx
// PHP + React (např. Laravel s Inertia)
import { AiInput } from 'ai-input-react'

export default function ChatWidget({ csrfToken }) {
  return (
    <AiInput
      mode="text"
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

## License

MIT
