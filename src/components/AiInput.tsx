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
 * Default UI component for text mode
 */
function TextModeUI({
    text,
    setText,
    submit,
    canSubmit,
    state,
    error,
    cooldownRemaining,
    placeholder = 'Type your message...',
    submitLabel = 'Send',
    disabled = false,
}: AiInputRenderProps & {
    placeholder?: string
    submitLabel?: string
    disabled?: boolean
}) {
    const isLoading = state === 'loading'
    const isRateLimited = state === 'rate-limited'
    const hasError = state === 'error'

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
            e.preventDefault()
            submit()
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isLoading || isRateLimited}
                rows={3}
                className={`
          w-full px-3 py-2 
          bg-zinc-900 border border-zinc-800 
          rounded-sm text-zinc-100 placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-none
          transition-colors
        `}
            />

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    {hasError && error && (
                        <span className="text-red-400">{error.message}</span>
                    )}
                    {isRateLimited && (
                        <span className="text-amber-400">
                            Cooldown: {formatDuration(cooldownRemaining)}
                        </span>
                    )}
                </div>

                <button
                    onClick={submit}
                    disabled={!canSubmit || disabled}
                    className={`
            px-4 py-2 
            bg-amber-500 hover:bg-amber-600 
            text-zinc-900 font-medium 
            rounded-sm
            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            flex items-center gap-2
          `}
                >
                    {isLoading && (
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
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
                    )}
                    {submitLabel}
                </button>
            </div>
        </div>
    )
}

/**
 * Default UI component for audio mode
 */
function AudioModeUI({
    isRecording,
    startRecording,
    stopRecording,
    recordingDuration,
    maxRecordingDuration,
    state,
    error,
    cooldownRemaining,
    canSubmit,
    recordLabel = 'Record',
    stopLabel = 'Stop',
    disabled = false,
}: AiInputRenderProps & {
    recordLabel?: string
    stopLabel?: string
    disabled?: boolean
}) {
    const isLoading = state === 'loading'
    const isRateLimited = state === 'rate-limited'
    const hasError = state === 'error'

    const progressPercent = (recordingDuration / maxRecordingDuration) * 100

    return (
        <div className="flex flex-col gap-3">
            {/* Recording progress */}
            {isRecording && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>Recording...</span>
                        <span>
                            {formatDuration(recordingDuration)} / {formatDuration(maxRecordingDuration)}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 transition-all duration-100"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
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
                    <span>Processing audio...</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    {hasError && error && (
                        <span className="text-red-400">{error.message}</span>
                    )}
                    {isRateLimited && (
                        <span className="text-amber-400">
                            Cooldown: {formatDuration(cooldownRemaining)}
                        </span>
                    )}
                </div>

                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={!canSubmit || disabled || isLoading}
                        className={`
              px-4 py-2 
              bg-amber-500 hover:bg-amber-600 
              text-zinc-900 font-medium 
              rounded-sm
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              flex items-center gap-2
            `}
                    >
                        {/* Microphone icon */}
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 256 256"
                            fill="currentColor"
                        >
                            <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z" />
                        </svg>
                        {recordLabel}
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        disabled={disabled}
                        className={`
              px-4 py-2 
              bg-red-500 hover:bg-red-600 
              text-white font-medium 
              rounded-sm
              focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              flex items-center gap-2
            `}
                    >
                        {/* Stop icon */}
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 256 256"
                            fill="currentColor"
                        >
                            <path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200V200Z" />
                        </svg>
                        {stopLabel}
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * AiInput Component
 * 
 * A React component for text/audio input with AI API integration.
 * Supports both controlled (headless) and uncontrolled (default UI) modes.
 * 
 * @example
 * // Default UI - Text mode
 * <AiInput
 *   mode="text"
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
 * // Headless mode with custom UI
 * <AiInput mode="text" send={sendFn}>
 *   {({ text, setText, submit, state }) => (
 *     <div>
 *       <input value={text} onChange={(e) => setText(e.target.value)} />
 *       <button onClick={submit} disabled={state === 'loading'}>
 *         Send
 *       </button>
 *     </div>
 *   )}
 * </AiInput>
 */
export function AiInput({
    mode,
    send,
    rateLimit,
    audioConfig,
    onSuccess,
    onError,
    children,
    placeholder,
    submitLabel,
    recordLabel,
    stopLabel,
    className,
    disabled = false,
}: AiInputProps) {
    const inputState = useAiInput({
        mode,
        send,
        rateLimit,
        audioConfig,
        onSuccess,
        onError,
    })

    // Headless mode - render prop
    if (children) {
        return <>{children(inputState)}</>
    }

    // Default UI
    return (
        <div className={`w-full ${className || ''}`}>
            {mode === 'text' ? (
                <TextModeUI
                    {...inputState}
                    placeholder={placeholder}
                    submitLabel={submitLabel}
                    disabled={disabled}
                />
            ) : (
                <AudioModeUI
                    {...inputState}
                    recordLabel={recordLabel}
                    stopLabel={stopLabel}
                    disabled={disabled}
                />
            )}
        </div>
    )
}
