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
 * Default UI for text input mode
 */
function DefaultTextUI({
    text,
    setText,
    submit,
    state,
    isSubmitDisabled,
    error,
    cooldownRemaining,
    placeholder = 'Enter your message...',
    submitLabel = 'Send',
    className = '',
}: AiInputRenderProps & { placeholder?: string; submitLabel?: string; className?: string }) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSubmitDisabled) {
            e.preventDefault()
            submit()
        }
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={state === 'loading'}
                className="min-h-[100px] w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-amber-400"
            />

            <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {state === 'loading' && (
                        <span className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                            Processing...
                        </span>
                    )}
                    {state === 'rate-limited' && cooldownRemaining > 0 && (
                        <span>Please wait {Math.ceil(cooldownRemaining / 1000)}s...</span>
                    )}
                    {state === 'error' && error && (
                        <span className="text-red-500 dark:text-red-400">{error.message}</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={submit}
                    disabled={isSubmitDisabled}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-400"
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    )
}

/**
 * Default UI for audio input mode
 */
function DefaultAudioUI({
    isRecording,
    startRecording,
    stopRecording,
    recordingDuration,
    state,
    error,
    cooldownRemaining,
    isRateLimited,
    recordLabel = 'Start Recording',
    stopLabel = 'Stop Recording',
    className = '',
}: AiInputRenderProps & { recordLabel?: string; stopLabel?: string; className?: string }) {
    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {/* Recording indicator */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-zinc-200 dark:border-zinc-800">
                {isRecording ? (
                    <div className="flex flex-col items-center">
                        <span className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
                        <span className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {formatDuration(recordingDuration)}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {state === 'loading' ? 'Sending...' : 'Ready'}
                    </span>
                )}
            </div>

            {/* Record/Stop button */}
            {isRecording ? (
                <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700"
                >
                    <span className="h-3 w-3 rounded-sm bg-white" />
                    {stopLabel}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={startRecording}
                    disabled={state === 'loading' || isRateLimited}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-400"
                >
                    <span className="h-3 w-3 rounded-full bg-white" />
                    {recordLabel}
                </button>
            )}

            {/* Status messages */}
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {state === 'loading' && (
                    <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                        Processing audio...
                    </span>
                )}
                {state === 'rate-limited' && cooldownRemaining > 0 && (
                    <span>Please wait {Math.ceil(cooldownRemaining / 1000)}s...</span>
                )}
                {state === 'error' && error && (
                    <span className="text-red-500 dark:text-red-400">{error.message}</span>
                )}
            </div>
        </div>
    )
}

/**
 * AiInput Component
 * 
 * A React component for text/audio input with AI API integration.
 * Supports both a default UI and headless mode via render props.
 * 
 * @example
 * ```tsx
 * // Default UI
 * <AiInput
 *   mode="text"
 *   send={async (input) => await fetch('/api/ai', { body: input })}
 *   onSuccess={(result) => console.log(result)}
 * />
 * 
 * // Headless mode
 * <AiInput mode="text" send={sendFn}>
 *   {({ text, setText, submit, state }) => (
 *     <div>
 *       <input value={text} onChange={(e) => setText(e.target.value)} />
 *       <button onClick={submit} disabled={state === 'loading'}>
 *         {state === 'loading' ? 'Sending...' : 'Send'}
 *       </button>
 *     </div>
 *   )}
 * </AiInput>
 * ```
 */
export function AiInput({
    mode,
    send,
    rateLimit,
    audioConfig,
    onSuccess,
    onError,
    onStateChange,
    children,
    placeholder,
    submitLabel,
    recordLabel,
    stopLabel,
    className,
}: AiInputProps): React.ReactElement {
    const renderProps = useAiInput({
        mode,
        send,
        rateLimit,
        audioConfig,
        onSuccess,
        onError,
        onStateChange,
    })

    // Headless mode - render prop
    if (children) {
        return <>{children(renderProps)}</>
    }

    // Default UI
    if (mode === 'text') {
        return (
            <DefaultTextUI
                {...renderProps}
                placeholder={placeholder}
                submitLabel={submitLabel}
                className={className}
            />
        )
    }

    return (
        <DefaultAudioUI
            {...renderProps}
            recordLabel={recordLabel}
            stopLabel={stopLabel}
            className={className}
        />
    )
}
