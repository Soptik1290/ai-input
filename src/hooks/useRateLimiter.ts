import { useState, useCallback, useRef, useEffect } from 'react'
import type { UseRateLimiterOptions, UseRateLimiterReturn } from '../types'

const DEFAULT_OPTIONS: UseRateLimiterOptions = {
    cooldownMs: 1000,
    maxRequests: 10,
    windowMs: 60000,
}

/**
 * Hook for soft rate limiting at the UI level.
 * Provides UX protection by tracking requests and enforcing cooldowns.
 * 
 * Note: This is not a security measure. Actual rate limiting 
 * should be handled by the AI provider or backend.
 * 
 * @param options - Rate limiting configuration
 * @returns Rate limiter state and controls
 */
export function useRateLimiter(
    options: Partial<UseRateLimiterOptions> = {}
): UseRateLimiterReturn {
    const config = { ...DEFAULT_OPTIONS, ...options }

    // Track request timestamps within the window
    const requestTimestamps = useRef<number[]>([])

    // Cooldown state
    const [cooldownEnd, setCooldownEnd] = useState<number>(0)
    const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)

    // Force re-render for requestsRemaining updates
    const [, forceUpdate] = useState({})

    // Cleanup old timestamps and calculate remaining requests
    const cleanupAndCount = useCallback(() => {
        const now = Date.now()
        const windowStart = now - config.windowMs

        // Remove timestamps outside the window
        requestTimestamps.current = requestTimestamps.current.filter(
            (ts) => ts > windowStart
        )

        return config.maxRequests - requestTimestamps.current.length
    }, [config.windowMs, config.maxRequests])

    // Update cooldown remaining
    useEffect(() => {
        if (cooldownEnd <= Date.now()) {
            setCooldownRemaining(0)
            return
        }

        const interval = setInterval(() => {
            const remaining = Math.max(0, cooldownEnd - Date.now())
            setCooldownRemaining(remaining)

            if (remaining === 0) {
                clearInterval(interval)
            }
        }, 100)

        return () => clearInterval(interval)
    }, [cooldownEnd])

    // Check if request is allowed
    const canRequest = useCallback(() => {
        const now = Date.now()

        // Check cooldown
        if (now < cooldownEnd) {
            return false
        }

        // Check request count
        return cleanupAndCount() > 0
    }, [cooldownEnd, cleanupAndCount])

    // Record a request
    const recordRequest = useCallback(() => {
        const now = Date.now()

        // Add timestamp
        requestTimestamps.current.push(now)

        // Start cooldown
        const newCooldownEnd = now + config.cooldownMs
        setCooldownEnd(newCooldownEnd)
        setCooldownRemaining(config.cooldownMs)

        // Trigger re-render
        forceUpdate({})
    }, [config.cooldownMs])

    // Reset rate limiter
    const reset = useCallback(() => {
        requestTimestamps.current = []
        setCooldownEnd(0)
        setCooldownRemaining(0)
        forceUpdate({})
    }, [])

    return {
        canRequest: canRequest(),
        cooldownRemaining,
        requestsRemaining: cleanupAndCount(),
        recordRequest,
        reset,
    }
}
