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
      mode="text"
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

- Všechny styly pro `AiInput` komponentu (text i audio mode)
- Dark theme (zinc base, amber accent)
- Animace a transitions
- Responzivní design

### Výhody

- ✅ Žádná konfigurace Tailwindu
- ✅ Žádná závislost na shadcn/ui
- ✅ Funguje v jakékoli React aplikaci
- ✅ Minimální bundle size (~3KB minified)

---

## Pokročilé použití: Tailwind + shadcn (volitelné)

> ⚠️ Tato sekce je určena pro **pokročilé uživatele**, kteří chtějí plnou kontrolu nad designem.

### Kdy použít

- Chcete přepsat výchozí styly
- Potřebujete konzistenci s vaším design systémem
- Používáte headless/primitive komponentu s vlastním UI

### Požadavky

1. **Tailwind CSS 4+**
2. **shadcn/ui** inicializovaný s tímto presetem:

```bash
npx shadcn@latest init \
  --preset "https://ui.shadcn.com/init?base=radix&style=maia&baseColor=zinc&theme=amber&iconLibrary=phosphor&font=inter&menuAccent=bold&menuColor=default&radius=small&template=next"
```

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
    <AiInput mode="text" send={sendFn}>
      {({ text, setText, submit, state, error }) => (
        <div className="your-custom-styles">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={submit} disabled={state === 'loading'}>
            {state === 'loading' ? 'Odesílám...' : 'Odeslat'}
          </button>
          {error && <p>{error.message}</p>}
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
| Plná kontrola nad styly | Tailwind + shadcn |

**Pro většinu uživatelů doporučujeme prepacked CSS.**

---

## Použití s Laravel (Inertia / Vite)

Balíček funguje v Laravel projektech s React (Vite + Inertia).

### Setup

```bash
# V Laravel projektu
npm install ai-input-react
```

```tsx
// resources/js/Pages/Chat.tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

export default function Chat({ csrfToken }) {
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

---

## Příklad: GPT-5-mini (Text)

```tsx
import { AiInput } from 'ai-input-react'
import 'ai-input-react/styles.css'

function GPT5Input({ token }) {
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
      onSuccess={(result) => console.log('GPT Response:', result)}
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
import 'ai-input-react/styles.css'

function WhisperInput({ token }) {
  return (
    <AiInput
      mode="audio"
      recordLabel="Nahrát"
      stopLabel="Stop"
      audioConfig={{
        maxDurationMs: 30000,
        mimeTypes: ['audio/webm', 'audio/mp4'],
      }}
      send={async (input) => {
        const formData = new FormData()
        formData.append('file', input as Blob, 'audio.webm')
        formData.append('model', 'whisper-1')
        formData.append('language', 'cs')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        })
        return response.json()
      }}
      onSuccess={(result) => console.log('Transkripce:', result)}
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
    mode: 'text',
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
- Přístup k mikrofonu (HTTPS nebo localhost)

---

## License

MIT
