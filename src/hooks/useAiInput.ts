import { useState, useCallback, useEffect, useRef } from 'react'
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
 * Unified design - text and audio in single component.
 * 
 * @param options - Configuration options
 * @returns Complete state and controls for AI input
 */
export function useAiInput(options: UseAiInputOptions): UseAiInputReturn {
    const {
        send,
        sendAudio,
        rateLimit = {},
        audioConfig = {},
        onSuccess,
        onError,
        onTranscription,
    } = options

    const rateLimitConfig = { ...DEFAULT_RATE_LIMIT, ...rateLimit }
    const audioConfigMerged = { ...DEFAULT_AUDIO_CONFIG, ...audioConfig }

    // State
    const [state, setState] = useState<AiInputState>('idle')
    const [text, setText] = useState('')
    const [error, setError] = useState<Error | null>(null)
    const [result, setResult] = useState<unknown>(null)

    // Ref to track if we're waiting to submit audio after recording stops
    const pendingAudioSubmitRef = useRef(false)

    // Rate limiter
    const rateLimiter = useRateLimiter(rateLimitConfig)

    // Audio recorder
    const audioRecorder = useAudioRecorder({
        ...audioConfigMerged,
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
            // Clear text after successful send
            setText('')
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
            // Use sendAudio if provided, otherwise use send
            const sendFn = sendAudio || send
            const response = await sendFn(blob)
            setResult(response)
            setState('success')
            onSuccess?.(response)

            // Handle transcription if callback provided
            if (onTranscription && response && typeof response === 'object') {
                const res = response as Record<string, unknown>
                // Try common transcription response formats
                const transcriptionText = res.text || res.transcription || res.transcript
                if (typeof transcriptionText === 'string') {
                    setText(transcriptionText)
                    onTranscription(transcriptionText)
                }
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Request failed')
            setError(error)
            setState('error')
            onError?.(error)
        }
    }, [rateLimiter, send, sendAudio, onSuccess, onError, onTranscription])

    // Handle audio blob ready - submit if we were waiting
    useEffect(() => {
        if (pendingAudioSubmitRef.current && audioRecorder.audioBlob && !audioRecorder.isRecording) {
            pendingAudioSubmitRef.current = false
            submitAudio(audioRecorder.audioBlob)
        }
    }, [audioRecorder.audioBlob, audioRecorder.isRecording, submitAudio])

    // Start recording
    const startRecording = useCallback(async () => {
        if (!rateLimiter.canRequest) {
            return
        }
        await audioRecorder.startRecording()
    }, [rateLimiter.canRequest, audioRecorder])

    // Stop recording and submit
    const stopRecording = useCallback(() => {
        // Mark that we want to submit audio when blob is ready
        pendingAudioSubmitRef.current = true
        audioRecorder.stopRecording()
    }, [audioRecorder])

    // Cancel recording (discard audio)
    const cancelRecording = useCallback(() => {
        audioRecorder.cancelRecording()
        setState('idle')
    }, [audioRecorder])

    // Submit based on current state
    const submit = useCallback(() => {
        if (audioRecorder.isRecording) {
            stopRecording()
        } else if (text.trim()) {
            submitText()
        }
    }, [audioRecorder.isRecording, text, stopRecording, submitText])

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
        (audioRecorder.isRecording || text.trim().length > 0)

    return {
        // State
        state,
        error,
        result,

        // Text
        text,
        setText,
        submit,
        canSubmit,

        // Audio
        isRecording: audioRecorder.isRecording,
        startRecording,
        stopRecording,
        cancelRecording,
        recordingDuration: audioRecorder.duration,
        maxRecordingDuration: audioConfigMerged.maxDurationMs,
        audioLevels: audioRecorder.audioLevels,

        // Rate limiting
        cooldownRemaining: rateLimiter.cooldownRemaining,
        requestsRemaining: rateLimiter.requestsRemaining,

        // Utils
        reset,
    }
}
