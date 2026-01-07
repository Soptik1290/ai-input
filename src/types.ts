import type { ReactNode } from 'react'

// =============================================================================
// MODES & STATES
// =============================================================================

/**
 * Input mode for the AiInput component
 */
export type AiInputMode = 'text' | 'audio'

/**
 * Current state of the AiInput component
 */
export type AiInputState =
    | 'idle'
    | 'loading'
    | 'success'
    | 'error'
    | 'rate-limited'
    | 'recording'

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Rate limiting configuration for UI protection
 * Note: This is soft rate limiting for UX only. 
 * Actual rate limiting should be handled by the AI provider.
 */
export interface RateLimitConfig {
    /** Cooldown between requests in milliseconds */
    cooldownMs: number
    /** Maximum number of requests allowed in the time window */
    maxRequests: number
    /** Time window in milliseconds for counting requests */
    windowMs: number
}

/**
 * Audio recording configuration
 */
export interface AudioConfig {
    /** Maximum recording duration in milliseconds */
    maxDurationMs: number
    /** 
     * Allowed MIME types for recording 
     * @example ['audio/webm', 'audio/mp4', 'audio/ogg']
     */
    mimeTypes: string[]
}

// =============================================================================
// TRANSPORT
// =============================================================================

/**
 * Transport function for sending input to AI API.
 * Must be provided by the host application.
 * 
 * @param input - Text string or audio Blob to send
 * @returns Promise resolving to the API response
 * 
 * @example
 * // Text input (GPT-5-mini)
 * const sendText: SendFunction = async (input) => {
 *   const response = await fetch('/api/chat', {
 *     method: 'POST',
 *     headers: { 'Authorization': `Bearer ${token}` },
 *     body: JSON.stringify({ message: input }),
 *   })
 *   return response.json()
 * }
 * 
 * @example
 * // Audio input (Whisper API)
 * const sendAudio: SendFunction = async (input) => {
 *   const formData = new FormData()
 *   formData.append('file', input as Blob, 'audio.webm')
 *   const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
 *     method: 'POST',
 *     headers: { 'Authorization': `Bearer ${token}` },
 *     body: formData,
 *   })
 *   return response.json()
 * }
 */
export type SendFunction = (input: string | Blob) => Promise<unknown>

// =============================================================================
// RENDER PROPS
// =============================================================================

/**
 * Props passed to render function for headless usage
 */
export interface AiInputRenderProps {
    // State
    /** Current component state */
    state: AiInputState
    /** Error if state is 'error' */
    error: Error | null
    /** Result from last successful request */
    result: unknown

    // Text mode
    /** Current text value (controlled) */
    text: string
    /** Update text value */
    setText: (value: string) => void
    /** Submit current text */
    submit: () => void
    /** Whether submit is currently allowed */
    canSubmit: boolean

    // Audio mode
    /** Whether currently recording */
    isRecording: boolean
    /** Start audio recording */
    startRecording: () => Promise<void>
    /** Stop audio recording and trigger send */
    stopRecording: () => void
    /** Current recording duration in milliseconds */
    recordingDuration: number
    /** Maximum recording duration in milliseconds */
    maxRecordingDuration: number

    // Rate limiting
    /** Remaining cooldown time in milliseconds */
    cooldownRemaining: number
    /** Remaining requests in current window */
    requestsRemaining: number

    // Utils
    /** Reset component to idle state */
    reset: () => void
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props for the AiInput component
 */
export interface AiInputProps {
    /** Input mode: 'text' for text input, 'audio' for voice recording */
    mode: AiInputMode

    /** 
     * Transport function for sending input to AI API.
     * Must be provided by the host application.
     */
    send: SendFunction

    /** Rate limiting configuration (optional) */
    rateLimit?: Partial<RateLimitConfig>

    /** Audio configuration (optional, only used in audio mode) */
    audioConfig?: Partial<AudioConfig>

    /** Callback when request succeeds */
    onSuccess?: (result: unknown) => void

    /** Callback when request fails */
    onError?: (error: Error) => void

    // Headless API
    /** 
     * Render function for headless usage.
     * When provided, default UI is not rendered.
     */
    children?: (props: AiInputRenderProps) => ReactNode

    // Default UI props
    /** Placeholder text for input (text mode only) */
    placeholder?: string

    /** Label for submit button (text mode only) */
    submitLabel?: string

    /** Label for record button (audio mode only) */
    recordLabel?: string

    /** Label for stop button (audio mode only) */
    stopLabel?: string

    /** Additional CSS classes for the container */
    className?: string

    /** Whether the input is disabled */
    disabled?: boolean
}

// =============================================================================
// HOOK TYPES
// =============================================================================

/**
 * Options for useRateLimiter hook
 */
export interface UseRateLimiterOptions {
    cooldownMs: number
    maxRequests: number
    windowMs: number
}

/**
 * Return type for useRateLimiter hook
 */
export interface UseRateLimiterReturn {
    canRequest: boolean
    cooldownRemaining: number
    requestsRemaining: number
    recordRequest: () => void
    reset: () => void
}

/**
 * Options for useAudioRecorder hook
 */
export interface UseAudioRecorderOptions {
    maxDurationMs: number
    mimeTypes: string[]
    onRecordingComplete?: (blob: Blob) => void
}

/**
 * Return type for useAudioRecorder hook
 */
export interface UseAudioRecorderReturn {
    isRecording: boolean
    isSupported: boolean
    duration: number
    audioBlob: Blob | null
    error: Error | null
    startRecording: () => Promise<void>
    stopRecording: () => void
    reset: () => void
}

/**
 * Options for useAiInput hook
 */
export interface UseAiInputOptions {
    mode: AiInputMode
    send: SendFunction
    rateLimit?: Partial<RateLimitConfig>
    audioConfig?: Partial<AudioConfig>
    onSuccess?: (result: unknown) => void
    onError?: (error: Error) => void
}

/**
 * Return type for useAiInput hook
 */
export type UseAiInputReturn = AiInputRenderProps
