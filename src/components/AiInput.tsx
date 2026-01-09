import React from 'react'
import { useAiInput } from '../hooks/useAiInput'
import type { AiInputProps, AiInputRenderProps } from '../types'

/**
 * Format milliseconds to MM:SS display
 */
function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Waveform visualization component with smooth animations
 */
function Waveform({ levels, className = '' }: { levels: number[]; className?: string }) {
    const bars = levels.length > 0 ? levels : Array(16).fill(0.15)

    return (
        <div className={`flex items-center justify-center gap-1 h-10 ${className}`}>
            {bars.map((level, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-amber-600 to-amber-400 rounded-full transition-all duration-100 ease-out"
                    style={{
                        height: `${Math.max(6, level * 40)}px`,
                        opacity: 0.6 + level * 0.4,
                    }}
                />
            ))}
        </div>
    )
}

/**
 * Recording pulse indicator
 */
function RecordingPulse() {
    return (
        <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
    )
}

/**
 * Microphone icon
 */
function MicIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z" />
        </svg>
    )
}

/**
 * Arrow up icon
 */
function ArrowUpIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" fill="currentColor">
            <path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z" />
        </svg>
    )
}

/**
 * Stop icon
 */
function StopIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" fill="currentColor">
            <rect x="64" y="64" width="128" height="128" rx="8" />
        </svg>
    )
}

/**
 * X icon
 */
function XIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" fill="currentColor">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
        </svg>
    )
}

/**
 * Spinner
 */
function Spinner({ className = '' }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    )
}

/**
 * Default UI - uses CSS variables for automatic theme detection
 * The CSS variables are defined in styles.css and automatically switch
 * based on prefers-color-scheme, .dark class, or data-theme attribute
 */
function DefaultUI({
    text,
    setText,
    submit,
    canSubmit,
    state,
    error,
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingDuration,
    audioLevels,
    cooldownRemaining,
    placeholder = 'Ask anything...',
    disabled = false,
}: AiInputRenderProps & {
    placeholder?: string
    disabled?: boolean
}) {
    const isLoading = state === 'loading'
    const isRateLimited = state === 'rate-limited'
    const hasError = state === 'error'

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && canSubmit && !isRecording) {
            e.preventDefault()
            submit()
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 56), 200)}px`
    }

    return (
        <div className="ai-input w-full">
            {/* Main container - uses CSS variables for theming */}
            <div
                className={`
                    ai-input-container
                    border rounded-xl
                    transition-all duration-300 ease-out
                    ${isRecording ? 'ai-input-recording' : ''}
                    ${disabled ? 'opacity-50' : ''}
                `}
            >
                {/* Text input */}
                <textarea
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? 'Listening...' : placeholder}
                    disabled={disabled || isLoading || isRateLimited}
                    rows={1}
                    className="ai-input-textarea w-full px-4 pt-4 pb-2 bg-transparent focus:outline-none disabled:cursor-not-allowed resize-none min-h-[56px] transition-colors duration-200"
                    style={{ height: '56px' }}
                />

                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3 pt-1">
                    {/* Left side */}
                    <div className="flex items-center gap-2">
                        {isRecording ? (
                            <>
                                <button
                                    onClick={cancelRecording}
                                    disabled={disabled}
                                    className="ai-input-btn-secondary p-2 rounded-lg transition-all duration-200 active:scale-95"
                                    aria-label="Cancel recording"
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                                <div className="flex items-center">
                                    <RecordingPulse />
                                    <Waveform levels={audioLevels} />
                                </div>
                                <span className="ai-input-text-muted text-sm font-mono tabular-nums">
                                    {formatDuration(recordingDuration)}
                                </span>
                            </>
                        ) : (
                            <div className="text-sm min-h-[28px] flex items-center">
                                {hasError && error && (
                                    <span className="ai-input-text-error animate-pulse">{error.message}</span>
                                )}
                                {isRateLimited && (
                                    <span className="ai-input-text-warning">
                                        Wait {formatDuration(cooldownRemaining)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {isRecording ? (
                            <button
                                onClick={stopRecording}
                                disabled={disabled}
                                className="p-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
                                aria-label="Stop recording"
                            >
                                <StopIcon className="h-5 w-5" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={startRecording}
                                    disabled={disabled || isLoading || isRateLimited}
                                    className="ai-input-btn-secondary p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    aria-label="Start recording"
                                >
                                    <MicIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={!canSubmit || disabled}
                                    className={`
                                        p-2.5 rounded-full transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                        ${canSubmit
                                            ? 'ai-input-btn-primary hover:scale-105 active:scale-95 shadow-lg'
                                            : 'ai-input-btn-disabled'
                                        }
                                    `}
                                    aria-label="Send message"
                                >
                                    {isLoading ? <Spinner className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * AiInput Component
 * 
 * Text/audio input with automatic light/dark mode detection.
 * 
 * **Theme Detection (in order of priority):**
 * 1. `.dark` class on html/body (Tailwind/Next.js)
 * 2. `data-theme="dark"` attribute
 * 3. `prefers-color-scheme` system preference
 */
export function AiInput({
    send,
    sendAudio,
    rateLimit,
    audioConfig,
    onSuccess,
    onError,
    onTranscription,
    children,
    placeholder,
    className,
    disabled = false,
}: AiInputProps) {
    const inputState = useAiInput({
        send,
        sendAudio,
        rateLimit,
        audioConfig,
        onSuccess,
        onError,
        onTranscription,
    })

    if (children) {
        return <>{children(inputState)}</>
    }

    return (
        <div className={`w-full ${className || ''}`}>
            <DefaultUI {...inputState} placeholder={placeholder} disabled={disabled} />
        </div>
    )
}
