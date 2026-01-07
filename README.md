# ai-input-react

React component for text/audio input with AI API integration. Framework-agnostic, works in Next.js, Vite, CRA, PHP with React, and more.

## Features

- 📝 **Text Mode**: Controlled text input with submit
- 🎤 **Audio Mode**: Record audio using Web APIs (MediaRecorder)
- 🚦 **Rate Limiting**: UI-level protection against excessive requests
- 🎨 **Headless API**: Full customization via render props
- 📦 **Zero Dependencies**: Only React as peer dependency
- 🔒 **Secure**: No API keys - transport function provided by host

## Installation

```bash
npm install ai-input-react
# or
yarn add ai-input-react
# or
pnpm add ai-input-react
```

## Prerequisites

Your host application must have:

1. **Tailwind CSS** configured
2. **shadcn/ui** initialized with the following preset:
   ```bash
   npx shadcn-ui@latest init \
     --preset "https://ui.shadcn.com/init?base=radix&style=maia&baseColor=zinc&theme=amber&iconLibrary=phosphor&font=inter&menuAccent=bold&menuColor=default&radius=small"
   ```

## Quick Start

### Text Mode (GPT-5-mini)

```tsx
import { AiInput } from 'ai-input-react'

function ChatComponent() {
  const sendToGPT = async (input: string | Blob) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getTemporaryToken()}`, // Get from your backend!
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [{ role: 'user', content: input as string }],
      }),
    })
    return response.json()
  }

  return (
    <AiInput
      mode="text"
      send={sendToGPT}
      onSuccess={(result) => console.log('AI Response:', result)}
      onError={(error) => console.error('Error:', error)}
      placeholder="Ask anything..."
      submitLabel="Send"
    />
  )
}
```

### Audio Mode (Whisper API)

```tsx
import { AiInput } from 'ai-input-react'

function VoiceComponent() {
  const sendToWhisper = async (input: string | Blob) => {
    const formData = new FormData()
    formData.append('file', input as Blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getTemporaryToken()}`, // Get from your backend!
      },
      body: formData,
    })
    return response.json()
  }

  return (
    <AiInput
      mode="audio"
      send={sendToWhisper}
      onSuccess={(result) => console.log('Transcription:', result)}
      audioConfig={{
        maxDurationMs: 30000, // 30 seconds max
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

## Next.js Integration

### App Router (app directory)

```tsx
// app/chat/page.tsx
'use client'

import { AiInput } from 'ai-input-react'

export default function ChatPage() {
  const send = async (input: string | Blob) => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: typeof input === 'string' ? JSON.stringify({ text: input }) : input,
    })
    return response.json()
  }

  return <AiInput mode="text" send={send} />
}
```

### Pages Router (pages directory)

```tsx
// pages/chat.tsx
import { AiInput } from 'ai-input-react'

export default function ChatPage() {
  const send = async (input: string | Blob) => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: typeof input === 'string' ? JSON.stringify({ text: input }) : input,
    })
    return response.json()
  }

  return <AiInput mode="text" send={send} />
}
```

## Headless Mode

For full control over the UI, use the render prop pattern:

```tsx
import { AiInput } from 'ai-input-react'

function CustomInput() {
  return (
    <AiInput mode="text" send={sendFn}>
      {({
        text,
        setText,
        submit,
        state,
        error,
        isSubmitDisabled,
        cooldownRemaining,
      }) => (
        <div className="my-custom-container">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="my-input"
          />
          
          <button onClick={submit} disabled={isSubmitDisabled}>
            {state === 'loading' ? 'Sending...' : 'Send'}
          </button>
          
          {state === 'error' && <p className="error">{error?.message}</p>}
          
          {state === 'rate-limited' && (
            <p>Wait {Math.ceil(cooldownRemaining / 1000)}s</p>
          )}
        </div>
      )}
    </AiInput>
  )
}
```

## Using Hooks Directly

For even more control, use the hooks directly:

```tsx
import { useAiInput, useAudioRecorder, useRateLimiter } from 'ai-input-react'

function MyComponent() {
  const {
    text,
    setText,
    submit,
    state,
    isRecording,
    startRecording,
    stopRecording,
  } = useAiInput({
    mode: 'audio',
    send: myTransportFn,
    onSuccess: handleSuccess,
  })

  // Build your own UI...
}
```

## API Reference

### `<AiInput>` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `"text" \| "audio"` | ✅ | Input mode |
| `send` | `(input: string \| Blob) => Promise<any>` | ✅ | Transport function |
| `rateLimit` | `RateLimitConfig` | ❌ | Rate limiting config |
| `audioConfig` | `AudioConfig` | ❌ | Audio recording config |
| `onSuccess` | `(result: any) => void` | ❌ | Success callback |
| `onError` | `(error: Error) => void` | ❌ | Error callback |
| `children` | `(props: RenderProps) => ReactNode` | ❌ | Render prop for headless mode |
| `placeholder` | `string` | ❌ | Input placeholder (text mode) |
| `submitLabel` | `string` | ❌ | Submit button label |
| `recordLabel` | `string` | ❌ | Record button label |
| `stopLabel` | `string` | ❌ | Stop button label |
| `className` | `string` | ❌ | Additional CSS classes |

### `RateLimitConfig`

```typescript
{
  cooldownMs: number    // Cooldown between requests (default: 1000)
  maxRequests: number   // Max requests in window (default: 10)
  windowMs: number      // Time window in ms (default: 60000)
}
```

### `AudioConfig`

```typescript
{
  maxDurationMs: number  // Max recording duration (default: 60000)
  mimeTypes: string[]    // Supported MIME types
}
```

### `RenderProps` (for headless mode)

| Prop | Type | Description |
|------|------|-------------|
| `state` | `"idle" \| "loading" \| "success" \| "error" \| "rate-limited" \| "recording"` | Current state |
| `error` | `Error \| null` | Error object if any |
| `result` | `any` | Last successful result |
| `text` | `string` | Current text value |
| `setText` | `(value: string) => void` | Set text value |
| `submit` | `() => void` | Submit text |
| `isSubmitDisabled` | `boolean` | Whether submit is disabled |
| `isRecording` | `boolean` | Whether recording |
| `startRecording` | `() => void` | Start recording |
| `stopRecording` | `() => void` | Stop recording |
| `recordingDuration` | `number` | Recording duration in ms |
| `audioBlob` | `Blob \| null` | Recorded audio |
| `cooldownRemaining` | `number` | Cooldown remaining in ms |
| `requestsRemaining` | `number` | Requests remaining |
| `isRateLimited` | `boolean` | Whether rate limited |

## Security

> ⚠️ **NEVER use secret API keys in frontend code!**

This component is designed for browser use. For secure AI API access:

1. **Use short-lived tokens** generated by your backend
2. **Proxy requests** through your backend API
3. **Implement proper authentication** on your server

```tsx
// ❌ WRONG - Never do this!
const token = 'sk-xxxxxxxxxxxxxxxxxxxxx' // Secret key exposed!

// ✅ CORRECT - Get temporary token from backend
const response = await fetch('/api/auth/ai-token')
const { token } = await response.json()
```

## Browser Compatibility

- **Text Mode**: All modern browsers
- **Audio Mode**: Requires `MediaRecorder` API support
  - Chrome 49+
  - Firefox 25+
  - Edge 79+
  - Safari 14.1+

## License

MIT
