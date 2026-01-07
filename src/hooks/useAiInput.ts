import { useState, useCallback, useMemo } from 'react'
import { useRateLimiter } from './useRateLimiter'
import { useAudioRecorder } from './useAudioRecorder'
import type {
    UseAiInputOptions,
    AiInputState,
    AiInputRenderProps,
    DEFAULT_RATE_LIMIT,
    DEFAULT_AUDIO_CONFIG,
} from '../types'
import {
    DEFAULT_RATE_LIMIT as defaultRateLimit,
    DEFAULT_AUDIO_CONFIG as defaultAudioConfig
} from '../types'

/**
 * Main hook for AI input functionality
 * Combines rate limiting, audio recording, and API communication
 * 
 * @param options - Configuration options
 * @returns Render props for the AI input component
 */
export function useAiInput(options: UseAiInputOptions): AiInputRenderProps {
    const {
        mode,
        send,
        rateLimit,
        audioConfig,
        onSuccess,
        onError,
        onStateChange,
    } = options

    // Merge with defaults
    const rateLimitConfig = useMemo(() => ({
        ...defaultRateLimit,
        ...rateLimit,
    }), [rateLimit])

    const audioConfigResolved = useMemo(() => ({
        ...defaultAudioConfig,
        ...audioConfig,
    }), [audioConfig])

    // State
    const [state, setState] = useState<AiInputState>('idle')
    const [text, setText] = useState('')
    const [error, setError] = useState<Error | null>(null)
    const [result, setResult] = useState<unknown>(null)

    // Update state with callback
    const updateState = useCallback((newState: AiInputState) => {
        setState(newState)
        onStateChange?.(newState)
    }, [onStateChange])

    // Rate limiter
    const rateLimiter = useRateLimiter(rateLimitConfig)

    // Handle recording complete
    const handleRecordingComplete = useCallback(async (blob: Blob) => {
        if (!rateLimiter.canRequest) {
            updateState('rate-limited')
            return
        }

        try {
            rateLimiter.recordRequest()
            updateState('loading')
            setError(null)

            const response = await send(blob)

            setResult(response)
            updateState('success')
            onSuccess?.(response)
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error')
            setError(errorObj)
            updateState('error')
            onError?.(errorObj)
        }
    }, [send, rateLimiter, updateState, onSuccess, onError])

    // Audio recorder
    const audioRecorder = useAudioRecorder({
        ...audioConfigResolved,
        onRecordingComplete: handleRecordingComplete,
    })

    // Submit text
    const submit = useCallback(async () => {
        if (!text.trim()) return

        if (!rateLimiter.canRequest) {
            updateState('rate-limited')
            return
        }

        try {
            rateLimiter.recordRequest()
            updateState('loading')
            setError(null)

            const response = await send(text)

            setResult(response)
            updateState('success')
            onSuccess?.(response)
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error')
            setError(errorObj)
            updateState('error')
            onError?.(errorObj)
        }
    }, [text, send, rateLimiter, updateState, onSuccess, onError])

    // Start recording
    const startRecording = useCallback(() => {
        if (!rateLimiter.canRequest) {
            updateState('rate-limited')
            return
        }

        updateState('recording')
        audioRecorder.startRecording()
    }, [rateLimiter, audioRecorder, updateState])

    // Stop recording
    const stopRecording = useCallback(() => {
        audioRecorder.stopRecording()
        // State will be updated by handleRecordingComplete
    }, [audioRecorder])

    // Computed values
    const isSubmitDisabled = useMemo(() => {
        if (mode === 'text') {
            return !text.trim() || state === 'loading' || !rateLimiter.canRequest
        }
        return state === 'loading' || state === 'recording' || !rateLimiter.canRequest
    }, [mode, text, state, rateLimiter.canRequest])

    const isRateLimited = !rateLimiter.canRequest

    // Sync audio recorder state
    const currentState = useMemo(() => {
        if (audioRecorder.isRecording) return 'recording' as const
        if (isRateLimited && state === 'idle') return 'rate-limited' as const
        return state
    }, [audioRecorder.isRecording, isRateLimited, state])

    return {
        state: currentState,
        error: error || audioRecorder.error,
        result,

        // Text mode
        text,
        setText,
        submit,
        isSubmitDisabled,

        // Audio mode
        isRecording: audioRecorder.isRecording,
        startRecording,
        stopRecording,
        recordingDuration: audioRecorder.duration,
        audioBlob: audioRecorder.audioBlob,

        // Rate limiting
        cooldownRemaining: rateLimiter.cooldownRemaining,
        requestsRemaining: rateLimiter.requestsRemaining,
        isRateLimited,
    }
}
