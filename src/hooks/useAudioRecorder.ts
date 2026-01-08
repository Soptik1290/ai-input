import { useState, useCallback, useRef, useEffect } from 'react'
import type { UseAudioRecorderOptions, UseAudioRecorderReturn } from '../types'

const DEFAULT_OPTIONS: UseAudioRecorderOptions = {
    maxDurationMs: 60000, // 1 minute
    mimeTypes: ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'],
}

/**
 * Get the best supported MIME type for MediaRecorder
 */
function getSupportedMimeType(preferredTypes: string[]): string | null {
    if (typeof MediaRecorder === 'undefined') {
        return null
    }

    for (const mimeType of preferredTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            return mimeType
        }
    }

    // Fallback to default
    return ''
}

/**
 * Hook for audio recording using Web APIs.
 * Uses navigator.mediaDevices, MediaRecorder, and Web Audio API for visualization.
 * 
 * @param options - Audio recording configuration
 * @returns Audio recorder state and controls
 */
export function useAudioRecorder(
    options: Partial<UseAudioRecorderOptions> = {}
): UseAudioRecorderReturn {
    const config = { ...DEFAULT_OPTIONS, ...options }

    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [audioLevels, setAudioLevels] = useState<number[]>([])

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const startTimeRef = useRef<number>(0)
    const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const maxDurationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Web Audio API refs for visualization
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    // Check if audio recording is supported
    const isSupported = typeof navigator !== 'undefined'
        && 'mediaDevices' in navigator
        && 'getUserMedia' in navigator.mediaDevices
        && typeof MediaRecorder !== 'undefined'

    // Update audio levels from analyser - uses time domain for better voice visualization
    const updateAudioLevels = useCallback(() => {
        if (!analyserRef.current) return

        const analyser = analyserRef.current
        const bufferLength = analyser.fftSize
        const dataArray = new Uint8Array(bufferLength)

        // Use time domain data for even distribution across bars
        analyser.getByteTimeDomainData(dataArray)

        // Sample 16 bars from the waveform data
        const bars = 16
        const step = Math.floor(bufferLength / bars)
        const levels: number[] = []

        for (let i = 0; i < bars; i++) {
            // Get amplitude variation from center (128) for each segment
            let maxDeviation = 0
            for (let j = 0; j < step; j++) {
                const value = dataArray[i * step + j]
                const deviation = Math.abs(value - 128)
                maxDeviation = Math.max(maxDeviation, deviation)
            }
            // Normalize to 0-1 range (max deviation is 128)
            // Apply some amplification for better visibility
            levels.push(Math.min(1, (maxDeviation / 128) * 2.5))
        }

        setAudioLevels(levels)

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(updateAudioLevels)
    }, [])

    // Cleanup function
    const cleanup = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
            durationIntervalRef.current = null
        }

        if (maxDurationTimeoutRef.current) {
            clearTimeout(maxDurationTimeoutRef.current)
            maxDurationTimeoutRef.current = null
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }

        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }

        analyserRef.current = null
        mediaRecorderRef.current = null
        chunksRef.current = []
        setAudioLevels([])
    }, [])

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
    }, [])

    // Start recording
    const startRecording = useCallback(async () => {
        if (!isSupported) {
            setError(new Error('Audio recording is not supported in this browser'))
            return
        }

        // Reset state
        setError(null)
        setAudioBlob(null)
        setDuration(0)
        setAudioLevels([])
        chunksRef.current = []

        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            // Set up Web Audio API for visualization
            const audioContext = new AudioContext()
            audioContextRef.current = audioContext

            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            analyser.smoothingTimeConstant = 0.8
            source.connect(analyser)
            analyserRef.current = analyser

            // Get supported MIME type
            const mimeType = getSupportedMimeType(config.mimeTypes)

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            mediaRecorderRef.current = mediaRecorder

            // Handle data available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            // Handle recording stop
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: mimeType || 'audio/webm'
                })
                setAudioBlob(blob)

                // Call callback if provided
                if (config.onRecordingComplete) {
                    config.onRecordingComplete(blob)
                }

                cleanup()
            }

            // Handle errors
            mediaRecorder.onerror = () => {
                setError(new Error('Recording error occurred'))
                setIsRecording(false)
                cleanup()
            }

            // Start recording
            mediaRecorder.start(100) // Collect data every 100ms
            startTimeRef.current = Date.now()
            setIsRecording(true)

            // Start audio level visualization
            updateAudioLevels()

            // Update duration every 100ms
            durationIntervalRef.current = setInterval(() => {
                setDuration(Date.now() - startTimeRef.current)
            }, 100)

            // Auto-stop at max duration
            maxDurationTimeoutRef.current = setTimeout(() => {
                stopRecording()
            }, config.maxDurationMs)

        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to access microphone'
            setError(new Error(errorMessage))
            cleanup()
        }
    }, [isSupported, config.mimeTypes, config.maxDurationMs, config.onRecordingComplete, cleanup, stopRecording, updateAudioLevels])

    // Cancel recording (discard audio)
    const cancelRecording = useCallback(() => {
        cleanup()
        setIsRecording(false)
        setDuration(0)
        setAudioBlob(null)
    }, [cleanup])

    // Reset hook state
    const reset = useCallback(() => {
        cleanup()
        setIsRecording(false)
        setDuration(0)
        setAudioBlob(null)
        setError(null)
        setAudioLevels([])
    }, [cleanup])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup()
        }
    }, [cleanup])

    return {
        isRecording,
        isSupported,
        duration,
        audioBlob,
        audioLevels,
        error,
        startRecording,
        stopRecording,
        cancelRecording,
        reset,
    }
}
