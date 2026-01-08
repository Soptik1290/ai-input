import type { ReactNode } from 'react'

// =============================================================================
// STATES
// =============================================================================

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

    // Text input
    /** Current text value (controlled) */
    text: string
    /** Update text value */
    setText: (value: string) => void
    /** Submit current text or audio */
    submit: () => void
    /** Whether submit is currently allowed */
    canSubmit: boolean

    // Audio recording
    /** Whether currently recording */
    isRecording: boolean
    /** Start audio recording */
    startRecording: () => Promise<void>
    /** Stop audio recording and send */
    stopRecording: () => void
    /** Cancel audio recording (discard) */
    cancelRecording: () => void
    /** Current recording duration in milliseconds */
    recordingDuration: number
    /** Maximum recording duration in milliseconds */
    maxRecordingDuration: number
    /** Audio levels for waveform visualization (0-1 normalized, 12 bars) */
    audioLevels: number[]

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
    /** 
     * Transport function for sending input to AI API.
     * Must be provided by the host application.
     */
    send: SendFunction

    /** 
     * Transport function specifically for audio (optional).
     * If provided, audio will be sent via this function.
     * If not provided, audio will be sent via `send`.
     */
    sendAudio?: SendFunction

    /** Rate limiting configuration (optional) */
    rateLimit?: Partial<RateLimitConfig>

    /** Audio configuration (optional) */
    audioConfig?: Partial<AudioConfig>

    /** Callback when request succeeds */
    onSuccess?: (result: unknown) => void

    /** Callback when request fails */
    onError?: (error: Error) => void

    /** 
     * Callback when audio transcription is received.
     * Use this to set the text in the input after transcription.
     */
    onTranscription?: (text: string) => void

    // Headless API
    /** 
     * Render function for headless usage.
     * When provided, default UI is not rendered.
     */
    children?: (props: AiInputRenderProps) => ReactNode

    // Default UI props
    /** Placeholder text for input */
    placeholder?: string

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
    audioLevels: number[]
    error: Error | null
    startRecording: () => Promise<void>
    stopRecording: () => void
    cancelRecording: () => void
    reset: () => void
}

/**
 * Options for useAiInput hook
 */
export interface UseAiInputOptions {
    send: SendFunction
    sendAudio?: SendFunction
    rateLimit?: Partial<RateLimitConfig>
    audioConfig?: Partial<AudioConfig>
    onSuccess?: (result: unknown) => void
    onError?: (error: Error) => void
    onTranscription?: (text: string) => void
}

/**
 * Return type for useAiInput hook
 */
export type UseAiInputReturn = AiInputRenderProps

// Legacy type alias for backwards compatibility
/** @deprecated Use AiInputProps without mode */
export type AiInputMode = 'text' | 'audio'
