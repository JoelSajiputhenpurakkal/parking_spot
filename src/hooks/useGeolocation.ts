import { useEffect, useState } from 'react'

export interface Fix {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export interface GeolocationState {
  fix: Fix | null
  error: string | null
  supported: boolean
}

/** Continuously watches the device position while `enabled` is true. */
export function useGeolocation(enabled = true): GeolocationState {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [fix, setFix] = useState<Fix | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !supported) return
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null)
        setFix({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
      },
      (err) => setError(err.message || 'Could not get your location'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [enabled, supported])

  return { fix, error, supported }
}
