import { useState, useCallback, useEffect } from 'react'
import { useRateLimiter } from './useRateLimiter'
import { useAudioRecorder } from './useAudioRecorder'
import type {
    UseAiInputOptions,
    UseAiInputReturn,
    AiInputState,
    RateLimitConfig,
    AudioConfig,
} from '../types'

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    cooldownMs: 1000,
    maxRequests: 10,
    windowMs: 60000,
}

const DEFAULT_AUDIO_CONFIG: AudioConfig = {
    maxDurationMs: 60000,
    mimeTypes: ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'],
}

/**
 * Main hook for AI input functionality.
 * Combines rate limiting, audio recording, and API communication.
 * 
 * @param options - Configuration options
 * @returns Complete state and controls for AI input
 */
export function useAiInput(options: UseAiInputOptions): UseAiInputReturn {
    const {
        mode,
        send,
        rateLimit = {},
        audioConfig = {},
        onSuccess,
        onError,
    } = options

    const rateLimitConfig = { ...DEFAULT_RATE_LIMIT, ...rateLimit }
    const audioConfigMerged = { ...DEFAULT_AUDIO_CONFIG, ...audioConfig }

    // State
    const [state, setState] = useState<AiInputState>('idle')
    const [text, setText] = useState('')
    const [error, setError] = useState<Error | null>(null)
    const [result, setResult] = useState<unknown>(null)

    // Rate limiter
    const rateLimiter = useRateLimiter(rateLimitConfig)

    // Audio recorder with callback to auto-submit
    const audioRecorder = useAudioRecorder({
        ...audioConfigMerged,
        onRecordingComplete: useCallback((blob: Blob) => {
            // Will be handled in stopRecording
        }, []),
    })

    // Update state based on rate limiter
    useEffect(() => {
        if (!rateLimiter.canRequest && state === 'idle') {
            setState('rate-limited')
        } else if (rateLimiter.canRequest && state === 'rate-limited') {
            setState('idle')
        }
    }, [rateLimiter.canRequest, state])

    // Update state when recording
    useEffect(() => {
        if (audioRecorder.isRecording && state !== 'recording') {
            setState('recording')
        }
    }, [audioRecorder.isRecording, state])

    // Handle audio recorder errors
    useEffect(() => {
        if (audioRecorder.error) {
            setError(audioRecorder.error)
            setState('error')
            onError?.(audioRecorder.error)
        }
    }, [audioRecorder.error, onError])

    // Submit text
    const submitText = useCallback(async () => {
        if (!text.trim() || !rateLimiter.canRequest) {
            return
        }

        setState('loading')
        setError(null)
        rateLimiter.recordRequest()

        try {
            const response = await send(text)
            setResult(response)
            setState('success')
            onSuccess?.(response)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Request failed')
            setError(error)
            setState('error')
            onError?.(error)
        }
    }, [text, rateLimiter, send, onSuccess, onError])

    // Submit audio
    const submitAudio = useCallback(async (blob: Blob) => {
        if (!rateLimiter.canRequest) {
            return
        }

        setState('loading')
        setError(null)
        rateLimiter.recordRequest()

        try {
            const response = await send(blob)
            setResult(response)
            setState('success')
            onSuccess?.(response)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Request failed')
            setError(error)
            setState('error')
            onError?.(error)
        }
    }, [rateLimiter, send, onSuccess, onError])

    // Start recording
    const startRecording = useCallback(async () => {
        if (!rateLimiter.canRequest) {
            return
        }
        await audioRecorder.startRecording()
    }, [rateLimiter.canRequest, audioRecorder])

    // Stop recording and submit
    const stopRecording = useCallback(() => {
        audioRecorder.stopRecording()

        // Wait for blob to be available, then submit
        // The MediaRecorder onstop event will set audioBlob
        const checkAndSubmit = () => {
            // Use a small delay to ensure blob is ready
            setTimeout(() => {
                if (audioRecorder.audioBlob) {
                    submitAudio(audioRecorder.audioBlob)
                }
            }, 100)
        }
        checkAndSubmit()
    }, [audioRecorder, submitAudio])

    // Submit based on mode
    const submit = useCallback(() => {
        if (mode === 'text') {
            submitText()
        }
        // Audio mode uses startRecording/stopRecording
    }, [mode, submitText])

    // Reset all state
    const reset = useCallback(() => {
        setState('idle')
        setText('')
        setError(null)
        setResult(null)
        rateLimiter.reset()
        audioRecorder.reset()
    }, [rateLimiter, audioRecorder])

    // Can submit check
    const canSubmit =
        rateLimiter.canRequest &&
        state !== 'loading' &&
        state !== 'recording' &&
        (mode === 'text' ? text.trim().length > 0 : true)

    return {
        // State
        state,
        error,
        result,

        // Text mode
        text,
        setText,
        submit,
        canSubmit,

        // Audio mode
        isRecording: audioRecorder.isRecording,
        startRecording,
        stopRecording,
        recordingDuration: audioRecorder.duration,
        maxRecordingDuration: audioConfigMerged.maxDurationMs,

        // Rate limiting
        cooldownRemaining: rateLimiter.cooldownRemaining,
        requestsRemaining: rateLimiter.requestsRemaining,

        // Utils
        reset,
    }
}
