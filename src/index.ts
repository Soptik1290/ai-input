// ============================================================================
// ai-input-react
// React component for text/audio input with AI API integration
// ============================================================================

// Components
export { AiInput } from './components/AiInput'

// Hooks
export { useAiInput } from './hooks/useAiInput'
export { useAudioRecorder } from './hooks/useAudioRecorder'
export { useRateLimiter } from './hooks/useRateLimiter'

// Types
export type {
    AiInputMode,
    AiInputState,
    AiInputProps,
    AiInputRenderProps,
    RateLimitConfig,
    AudioConfig,
    SendFunction,
    UseAiInputOptions,
    UseRateLimiterOptions,
    UseRateLimiterReturn,
    UseAudioRecorderOptions,
    UseAudioRecorderReturn,
} from './types'

// Constants
export { DEFAULT_RATE_LIMIT, DEFAULT_AUDIO_CONFIG } from './types'
