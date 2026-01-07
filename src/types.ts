// ============================================================================
// AI Input React - Public Types
// ============================================================================

/**
 * Input mode for the AiInput component
 */
export type AiInputMode = "text" | "audio"

/**
 * State of the AiInput component
 */
export type AiInputState =
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "rate-limited"
    | "recording"

/**
 * Rate limiting configuration for UI-level protection
 */
export interface RateLimitConfig {
    /** Cooldown duration between requests in milliseconds */
    cooldownMs: number
    /** Maximum number of requests allowed in the time window */
    maxRequests: number
    /** Time window for request counting in milliseconds */
    windowMs: number
}

/**
 * Audio recording configuration
 */
export interface AudioConfig {
    /** Maximum recording duration in milliseconds */
    maxDurationMs: number
    /** Supported MIME types for audio recording */
    mimeTypes: string[]
}

/**
 * Transport function for sending input to AI API
 * This function is provided by the host application
 * @param input - Text string or audio Blob to send
 * @returns Promise resolving to API response
 */
export type SendFunction = (input: string | Blob) => Promise<unknown>

/**
 * Render props / headless API for AiInput component
 */
export interface AiInputRenderProps {
    /** Current state of the component */
    state: AiInputState
    /** Error object if state is "error" */
    error: Error | null
    /** Result from the last successful API call */
    result: unknown

    // Text mode controls
    /** Current text value */
    text: string
    /** Set text value */
    setText: (value: string) => void
    /** Submit text to AI API */
    submit: () => void
    /** Whether submit is currently disabled */
    isSubmitDisabled: boolean

    // Audio mode controls
    /** Whether currently recording */
    isRecording: boolean
    /** Start audio recording */
    startRecording: () => void
    /** Stop audio recording and submit */
    stopRecording: () => void
    /** Current recording duration in milliseconds */
    recordingDuration: number
    /** Last recorded audio blob */
    audioBlob: Blob | null

    // Rate limiting info
    /** Remaining cooldown time in milliseconds */
    cooldownRemaining: number
    /** Remaining requests in current time window */
    requestsRemaining: number
    /** Whether rate limited */
    isRateLimited: boolean
}

/**
 * Props for the AiInput component
 */
export interface AiInputProps {
    /** Input mode: text or audio */
    mode: AiInputMode
    /** Transport function for sending input to AI API */
    send: SendFunction
    /** Rate limiting configuration (optional) */
    rateLimit?: Partial<RateLimitConfig>
    /** Audio configuration (optional, only for audio mode) */
    audioConfig?: Partial<AudioConfig>
    /** Callback when API call succeeds */
    onSuccess?: (result: unknown) => void
    /** Callback when API call fails */
    onError?: (error: Error) => void
    /** Callback when state changes */
    onStateChange?: (state: AiInputState) => void

    // Headless API - render prop pattern
    /** Render function for headless mode */
    children?: (props: AiInputRenderProps) => React.ReactNode

    // Default UI props (ignored when children is provided)
    /** Placeholder text for input field */
    placeholder?: string
    /** Label for submit button */
    submitLabel?: string
    /** Label for record button */
    recordLabel?: string
    /** Label for stop recording button */
    stopLabel?: string
    /** Additional CSS classes */
    className?: string
}

/**
 * Props for useAiInput hook
 */
export interface UseAiInputOptions {
    mode: AiInputMode
    send: SendFunction
    rateLimit?: Partial<RateLimitConfig>
    audioConfig?: Partial<AudioConfig>
    onSuccess?: (result: unknown) => void
    onError?: (error: Error) => void
    onStateChange?: (state: AiInputState) => void
}

/**
 * Props for useRateLimiter hook
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
 * Props for useAudioRecorder hook
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
}

// ============================================================================
// Default configurations
// ============================================================================

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    cooldownMs: 1000,
    maxRequests: 10,
    windowMs: 60000,
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
    maxDurationMs: 60000, // 1 minute
    mimeTypes: [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg',
        'audio/wav',
    ],
}
