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
 * Waveform visualization component
 */
function Waveform({ levels, className = '' }: { levels: number[]; className?: string }) {
    // Generate 12 bars if no levels provided
    const bars = levels.length > 0 ? levels : Array(12).fill(0.1)

    return (
        <div className={`flex items-center justify-center gap-0.5 h-8 ${className}`}>
            {bars.map((level, i) => (
                <div
                    key={i}
                    className="w-1 bg-amber-500 rounded-full transition-all duration-75"
                    style={{
                        height: `${Math.max(4, level * 32)}px`,
                    }}
                />
            ))}
        </div>
    )
}

/**
 * Microphone icon (Phosphor style)
 */
function MicIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z" />
        </svg>
    )
}

/**
 * Arrow up icon for submit
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
            <path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200V200Z" />
        </svg>
    )
}

/**
 * X icon for cancel
 */
function XIcon({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 256 256" fill="currentColor">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
        </svg>
    )
}

/**
 * Spinner for loading state
 */
function Spinner({ className = '' }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    )
}

/**
 * Default UI for the unified AiInput component
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
    maxRecordingDuration,
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

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
        // Reset height to auto to get the correct scrollHeight
        e.target.style.height = 'auto'
        // Set height to scrollHeight, with min and max constraints
        e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 56), 200)}px`
    }

    return (
        <div className="w-full">
            {/* Main container */}
            <div
                className={`
                    bg-zinc-900 border border-zinc-800 rounded-xl
                    focus-within:ring-1 focus-within:ring-amber-500/50 focus-within:border-amber-500/50
                    transition-all duration-200
                    ${disabled ? 'opacity-50' : ''}
                `}
            >
                {/* Recording waveform */}
                {isRecording && (
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <Waveform levels={audioLevels} />
                            <span className="text-sm text-zinc-400 font-mono ml-4">
                                {formatDuration(recordingDuration)} / {formatDuration(maxRecordingDuration)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Text input area - hidden during recording */}
                {!isRecording && (
                    <textarea
                        value={text}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isLoading || isRateLimited}
                        rows={1}
                        className={`
                            w-full px-4 pt-4 pb-2
                            bg-transparent text-zinc-100 placeholder:text-zinc-500
                            focus:outline-none
                            disabled:cursor-not-allowed
                            resize-none
                            min-h-[56px]
                        `}
                        style={{ height: '56px' }}
                    />
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3 pt-1">
                    {/* Left side - error/status */}
                    <div className="text-sm">
                        {hasError && error && (
                            <span className="text-red-400">{error.message}</span>
                        )}
                        {isRateLimited && (
                            <span className="text-amber-400">
                                Wait {formatDuration(cooldownRemaining)}
                            </span>
                        )}
                    </div>

                    {/* Right side - action buttons */}
                    <div className="flex items-center gap-2">
                        {isRecording ? (
                            <>
                                {/* Cancel recording */}
                                <button
                                    onClick={cancelRecording}
                                    disabled={disabled}
                                    className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                                    aria-label="Cancel recording"
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>

                                {/* Stop and send */}
                                <button
                                    onClick={stopRecording}
                                    disabled={disabled}
                                    className={`
                                        p-2.5 rounded-full
                                        bg-red-500 hover:bg-red-600
                                        text-white
                                        transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                    aria-label="Stop recording"
                                >
                                    <StopIcon className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Mic button */}
                                <button
                                    onClick={startRecording}
                                    disabled={disabled || isLoading || isRateLimited}
                                    className={`
                                        p-2 text-zinc-400 hover:text-zinc-200
                                        transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                    aria-label="Start recording"
                                >
                                    <MicIcon className="h-5 w-5" />
                                </button>

                                {/* Submit button */}
                                <button
                                    onClick={submit}
                                    disabled={!canSubmit || disabled}
                                    className={`
                                        p-2.5 rounded-full
                                        transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${canSubmit
                                            ? 'bg-amber-500 hover:bg-amber-600 text-zinc-900'
                                            : 'bg-zinc-700 text-zinc-500'
                                        }
                                    `}
                                    aria-label="Send message"
                                >
                                    {isLoading ? (
                                        <Spinner className="h-5 w-5" />
                                    ) : (
                                        <ArrowUpIcon className="h-5 w-5" />
                                    )}
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
 * A React component for text/audio input with AI API integration.
 * Unified design with text input and audio recording in a single component.
 * 
 * @example
 * // Basic usage
 * <AiInput
 *   send={async (input) => {
 *     const response = await fetch('/api/chat', {
 *       method: 'POST',
 *       body: JSON.stringify({ message: input }),
 *     })
 *     return response.json()
 *   }}
 *   onSuccess={(result) => console.log(result)}
 * />
 * 
 * @example
 * // With separate audio handler and transcription
 * <AiInput
 *   send={sendTextFn}
 *   sendAudio={sendAudioFn}
 *   onTranscription={(text) => console.log('Transcribed:', text)}
 * />
 * 
 * @example
 * // Headless mode with custom UI
 * <AiInput send={sendFn}>
 *   {({ text, setText, submit, state, isRecording, audioLevels }) => (
 *     <div>
 *       {isRecording ? (
 *         <MyWaveform levels={audioLevels} />
 *       ) : (
 *         <input value={text} onChange={(e) => setText(e.target.value)} />
 *       )}
 *       <button onClick={submit}>Send</button>
 *     </div>
 *   )}
 * </AiInput>
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

    // Headless mode - render prop
    if (children) {
        return <>{children(inputState)}</>
    }

    // Default UI
    return (
        <div className={`w-full ${className || ''}`}>
            <DefaultUI
                {...inputState}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    )
}
