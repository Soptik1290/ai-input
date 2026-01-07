import { useState, useCallback, useRef, useEffect } from 'react'
import type { UseAudioRecorderOptions, UseAudioRecorderReturn } from '../types'

/**
 * Hook for audio recording using Web APIs
 * Uses navigator.mediaDevices and MediaRecorder
 * 
 * @param options - Audio recorder configuration
 * @returns Audio recorder state and controls
 */
export function useAudioRecorder(options: UseAudioRecorderOptions): UseAudioRecorderReturn {
    const { maxDurationMs, mimeTypes, onRecordingComplete } = options

    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [error, setError] = useState<Error | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const startTimeRef = useRef<number>(0)
    const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Check browser support
    const isSupported = typeof navigator !== 'undefined'
        && navigator.mediaDevices
        && typeof MediaRecorder !== 'undefined'

    // Get supported MIME type
    const getSupportedMimeType = useCallback((): string | undefined => {
        if (typeof MediaRecorder === 'undefined') return undefined

        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                return mimeType
            }
        }

        // Fallback to default
        return undefined
    }, [mimeTypes])

    // Stop recording helper
    const stopRecordingInternal = useCallback(() => {
        // Stop duration timer
        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current)
            durationTimerRef.current = null
        }

        // Clear max duration timer
        if (maxDurationTimerRef.current) {
            clearTimeout(maxDurationTimerRef.current)
            maxDurationTimerRef.current = null
        }

        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }

        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        setIsRecording(false)
    }, [])

    // Start recording
    const startRecording = useCallback(async () => {
        if (!isSupported) {
            setError(new Error('Audio recording is not supported in this browser'))
            return
        }

        try {
            setError(null)
            setAudioBlob(null)
            chunksRef.current = []

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            // Get supported MIME type
            const mimeType = getSupportedMimeType()

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            mediaRecorderRef.current = mediaRecorder

            // Handle data available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            // Handle stop
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: mimeType || 'audio/webm'
                })
                setAudioBlob(blob)
                onRecordingComplete?.(blob)
            }

            // Handle error
            mediaRecorder.onerror = (event) => {
                setError(new Error('Recording error occurred'))
                stopRecordingInternal()
            }

            // Start recording
            mediaRecorder.start(100) // Collect data every 100ms
            setIsRecording(true)
            startTimeRef.current = Date.now()
            setDuration(0)

            // Update duration every 100ms
            durationTimerRef.current = setInterval(() => {
                setDuration(Date.now() - startTimeRef.current)
            }, 100)

            // Auto-stop after max duration
            maxDurationTimerRef.current = setTimeout(() => {
                stopRecordingInternal()
            }, maxDurationMs)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
            setError(new Error(errorMessage))
            setIsRecording(false)
        }
    }, [isSupported, getSupportedMimeType, maxDurationMs, onRecordingComplete, stopRecordingInternal])

    // Public stop recording
    const stopRecording = useCallback(() => {
        stopRecordingInternal()
    }, [stopRecordingInternal])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRecordingInternal()
        }
    }, [stopRecordingInternal])

    return {
        isRecording,
        isSupported,
        duration,
        audioBlob,
        error,
        startRecording,
        stopRecording,
    }
}
