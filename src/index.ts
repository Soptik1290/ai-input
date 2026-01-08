// Components
export { AiInput } from './components/AiInput'

// Hooks (for headless usage)
export { useAiInput } from './hooks/useAiInput'
export { useAudioRecorder } from './hooks/useAudioRecorder'
export { useRateLimiter } from './hooks/useRateLimiter'

// Types
export type {
    // States
    AiInputState,

    // Configuration
    RateLimitConfig,
    AudioConfig,

    // Transport
    SendFunction,

    // Component Props
    AiInputProps,
    AiInputRenderProps,

    // Hook Types
    UseRateLimiterOptions,
    UseRateLimiterReturn,
    UseAudioRecorderOptions,
    UseAudioRecorderReturn,
    UseAiInputOptions,
    UseAiInputReturn,

    // Legacy
    AiInputMode,
} from './types'
