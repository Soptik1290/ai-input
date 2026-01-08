# ai-input-react

React komponenta pro text/audio vstup s AI API integrací. Framework-agnostická – funguje s Next.js, Vite, Laravel a jakýmkoli React setupem.

## Quick Start (Next.js)

Minimální setup s předkompilovaným CSS – **nevyžaduje Tailwind ani shadcn/ui**.

```bash
# 1. Vytvoření Next.js aplikace
npx create-next-app@latest my-app
cd my-app

# 2. Instalace balíčku
npm install ai-input-react
```

```tsx
// app/page.tsx (App Router)
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

## Prepacked CSS (výchozí)

Balíček obsahuje **předkompilované CSS** (`dist/styles.css`), které funguje okamžitě bez jakékoli konfigurace.

### Import

```tsx
import 'ai-input-react/styles.css'
```

### Co je zahrnuto

- Unified input (text + audio v jednom)
- Waveform vizualizace při nahrávání
- Dark theme (zinc base, amber accent)
- Animace a transitions

### Výhody

- ✅ Žádná konfigurace Tailwindu
- ✅ Žádná závislost na shadcn/ui
- ✅ Funguje v jakékoli React aplikaci
- ✅ Minimální bundle size (~10KB)

---

## Pokročilé použití: Tailwind + shadcn (volitelné)

> ⚠️ Tato sekce je určena pro **pokročilé uživatele**, kteří chtějí plnou kontrolu nad designem.

### Použití bez prepacked CSS

Při použití s Tailwindem **neimportujte** prepacked CSS:

```tsx
// ❌ NEPOUŽÍVAT s Tailwindem
import 'ai-input-react/styles.css'

// ✅ Tailwind zpracuje utility classes automaticky
import { AiInput } from 'ai-input-react'
```

### Headless použití (vlastní UI)

Pro úplnou kontrolu nad UI použijte render prop pattern:

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
            {state === 'loading' ? 'Odesílám...' : isRecording ? 'Stop' : 'Odeslat'}
          </button>
          <button onClick={startRecording}>🎤</button>
        </div>
      )}
    </AiInput>
  )
}
```

---

## Jaký setup zvolit?

| Situace | Doporučení |
|---------|------------|
| Rychlý prototyp | Prepacked CSS |
| Nový projekt bez Tailwindu | Prepacked CSS |
| Existující projekt s Tailwindem | Tailwind (bez prepacked CSS) |
| Vlastní design systém | Headless + vlastní UI |

**Pro většinu uživatelů doporučujeme prepacked CSS.**

---

## Příklad: Text + Audio s GPT a Whisper

```tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

function ChatInput({ token }) {
  return (
    <AiInput
      placeholder="Ask anything..."
      send={async (input) => {
        // Text input -> GPT
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
      sendAudio={async (blob) => {
        // Audio input -> Whisper
        const formData = new FormData()
        formData.append('file', blob, 'audio.webm')
        formData.append('model', 'whisper-1')
        formData.append('language', 'cs')

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

## Použití hooků samostatně

```tsx
import { useAiInput, useAudioRecorder, useRateLimiter } from 'ai-input-react'

function CustomComponent() {
  const aiInput = useAiInput({
    send: async (input) => { /* ... */ },
    rateLimit: { cooldownMs: 1000 },
  })

  // Nebo pouze audio recorder
  const recorder = useAudioRecorder({
    maxDurationMs: 60000,
    onRecordingComplete: (blob) => console.log('Recording complete:', blob),
  })

  // Nebo pouze rate limiter
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
| `send` | `(input: string \| Blob) => Promise<any>` | required | Transport funkce pro text |
| `sendAudio` | `(blob: Blob) => Promise<any>` | - | Volitelný transport pro audio |
| `rateLimit` | `RateLimitConfig` | `{ cooldownMs: 1000, ... }` | Rate limiting |
| `audioConfig` | `AudioConfig` | `{ maxDurationMs: 60000, ... }` | Audio nastavení |
| `onSuccess` | `(result: any) => void` | - | Callback při úspěchu |
| `onError` | `(error: Error) => void` | - | Callback při chybě |
| `onTranscription` | `(text: string) => void` | - | Callback po audio transkripci |
| `children` | `(props: AiInputRenderProps) => ReactNode` | - | Headless render prop |
| `placeholder` | `string` | `'Ask anything...'` | Placeholder textu |
| `className` | `string` | - | CSS třídy pro container |
| `disabled` | `boolean` | `false` | Zakázat vstup |

### `AiInputRenderProps`

Při použití render prop (`children`) získáte tyto props:

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
  audioLevels: number[]  // Pro waveform vizualizaci
  
  // Rate limiting
  cooldownRemaining: number
  requestsRemaining: number
  
  reset: () => void
}
```

---

## ⚠️ Bezpečnostní upozornění

> **NIKDY neukládejte tajné API klíče ve frontendovém kódu!**

Tento balíček je navržen pro browser-side použití, kde jsou tokeny poskytnuty z hostitelské aplikace.

### Doporučený přístup

1. **Krátkodobé tokeny**: Generujte tokeny s omezenou platností na vašem backendu
2. **Proxy API**: Vytvořte API route, která přidá autentizaci
3. **Session-based auth**: Použijte session cookies pro ověření

```tsx
// ❌ ŠPATNĚ
const API_KEY = 'sk-...' // NEBEZPEČNÉ!

// ✅ SPRÁVNĚ
const token = await getTokenFromBackend()
```

---

## Podpora prohlížečů

- Chrome 49+
- Firefox 36+
- Safari 14.1+
- Edge 79+

Audio nahrávání vyžaduje:
- Podporu `MediaRecorder` API
- Web Audio API pro waveform
- Přístup k mikrofonu (HTTPS nebo localhost)

---

## License

MIT
