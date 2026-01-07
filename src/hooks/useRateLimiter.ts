import { useState, useCallback, useRef, useEffect } from 'react'
import type { UseRateLimiterOptions, UseRateLimiterReturn } from '../types'

/**
 * Hook for UI-level rate limiting
 * Provides soft protection against excessive API calls
 * 
 * @param options - Rate limiter configuration
 * @returns Rate limiter state and controls
 */
export function useRateLimiter(options: UseRateLimiterOptions): UseRateLimiterReturn {
    const { cooldownMs, maxRequests, windowMs } = options

    // Track request timestamps in current window
    const requestTimestamps = useRef<number[]>([])

    // Cooldown state
    const [cooldownRemaining, setCooldownRemaining] = useState(0)
    const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Force re-render for requestsRemaining calculation
    const [, forceUpdate] = useState({})

    // Clean up old timestamps outside the window
    const cleanupTimestamps = useCallback(() => {
        const now = Date.now()
        requestTimestamps.current = requestTimestamps.current.filter(
            (timestamp) => now - timestamp < windowMs
        )
    }, [windowMs])

    // Calculate requests remaining in current window
    const getRequestsRemaining = useCallback(() => {
        cleanupTimestamps()
        return Math.max(0, maxRequests - requestTimestamps.current.length)
    }, [cleanupTimestamps, maxRequests])

    // Check if request is allowed
    const canRequest = cooldownRemaining === 0 && getRequestsRemaining() > 0

    // Record a new request
    const recordRequest = useCallback(() => {
        const now = Date.now()

        // Add timestamp
        requestTimestamps.current.push(now)

        // Start cooldown timer
        setCooldownRemaining(cooldownMs)

        // Clear existing timer
        if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current)
        }

        // Update cooldown every 100ms
        const startTime = now
        cooldownTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = Math.max(0, cooldownMs - elapsed)
            setCooldownRemaining(remaining)

            if (remaining === 0) {
                if (cooldownTimerRef.current) {
                    clearInterval(cooldownTimerRef.current)
                    cooldownTimerRef.current = null
                }
            }
        }, 100)

        // Force update for requestsRemaining
        forceUpdate({})
    }, [cooldownMs])

    // Reset rate limiter
    const reset = useCallback(() => {
        requestTimestamps.current = []
        setCooldownRemaining(0)
        if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current)
            cooldownTimerRef.current = null
        }
        forceUpdate({})
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current)
            }
        }
    }, [])

    return {
        canRequest,
        cooldownRemaining,
        requestsRemaining: getRequestsRemaining(),
        recordRequest,
        reset,
    }
}
