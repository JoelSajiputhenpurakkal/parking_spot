import { useEffect, useMemo, useState } from 'react'
import type { Spot } from '../db'
import { MapView } from './MapView'
import { useGeolocation } from '../hooks/useGeolocation'
import { useHeading } from '../hooks/useHeading'
import {
  bearingDegrees,
  compassLabel,
  directionsUrl,
  distanceMeters,
  formatDistance,
  walkingMinutes,
} from '../geo'

function useObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return url
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

interface FindCarProps {
  spot: Spot
  onFound: () => void
}

export function FindCar({ spot, onFound }: FindCarProps) {
  const { fix, error } = useGeolocation()
  const { heading, granted, requestAccess, needsPermission } = useHeading()
  const photoUrl = useObjectUrl(spot.photo)
  const now = useNow()

  const me = fix ? { lat: fix.lat, lng: fix.lng } : null
  const car = { lat: spot.lat, lng: spot.lng }

  const metrics = useMemo(() => {
    if (!me) return null
    return { distance: distanceMeters(me, car), bearing: bearingDegrees(me, car) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.lat, me?.lng, car.lat, car.lng])

  const arrowRotation = metrics ? metrics.bearing - (heading ?? 0) : 0
  const remaining = spot.expiresAt ? spot.expiresAt - now : null
  const expired = remaining !== null && remaining <= 0

  useEffect(() => {
    if (!expired) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification('Parking timer is up', {
      body: 'Your parking session has expired — head back to the car.',
    })
  }, [expired])

  return (
    <section className="panel">
      <div className="hero">
        <div className="arrow-wrap">
          <div className="arrow" style={{ transform: `rotate(${arrowRotation - 90}deg)` }}>
            ➤
          </div>
        </div>
        <div className="hero-text">
          {metrics ? (
            <>
              <strong className="distance">{formatDistance(metrics.distance)}</strong>
              <span>
                {compassLabel(metrics.bearing)} · about {walkingMinutes(metrics.distance)} min walk
              </span>
            </>
          ) : (
            <>
              <strong className="distance">—</strong>
              <span>{error ?? 'Locating you…'}</span>
            </>
          )}
          {heading === null && metrics && (
            <span className="hint">
              Arrow points relative to north (no compass on this device).
            </span>
          )}
        </div>
      </div>

      {needsPermission && !granted && (
        <button type="button" className="btn btn-ghost" onClick={requestAccess}>
          Enable compass
        </button>
      )}

      {remaining !== null && (
        <div className={`timer ${expired ? 'timer-out' : ''}`}>
          {expired
            ? 'Parking timer expired'
            : `Parking timer: ${formatCountdown(remaining)} left`}
        </div>
      )}

      <MapView car={car} me={me} />

      <dl className="details">
        {spot.floor && (
          <div>
            <dt>Floor</dt>
            <dd>{spot.floor}</dd>
          </div>
        )}
        {spot.bay && (
          <div>
            <dt>Bay</dt>
            <dd>{spot.bay}</dd>
          </div>
        )}
        <div>
          <dt>Parked</dt>
          <dd>{new Date(spot.savedAt).toLocaleString()}</dd>
        </div>
      </dl>

      {spot.note && <p className="note">“{spot.note}”</p>}
      {photoUrl && <img className="photo" src={photoUrl} alt="Saved parking spot" />}

      <div className="actions">
        <a
          className="btn btn-primary"
          href={directionsUrl(car)}
          target="_blank"
          rel="noreferrer"
        >
          Walk me there
        </a>
        <button type="button" className="btn btn-ghost" onClick={onFound}>
          I found my car
        </button>
      </div>
    </section>
  )
}
