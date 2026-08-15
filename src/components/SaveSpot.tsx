import { useRef, useState } from 'react'
import type { Spot } from '../db'
import { MapView } from './MapView'
import { useGeolocation } from '../hooks/useGeolocation'
import type { LatLng } from '../geo'

const TIMER_OPTIONS = [
  { label: 'No timer', minutes: 0 },
  { label: '30 min', minutes: 30 },
  { label: '1 hr', minutes: 60 },
  { label: '2 hr', minutes: 120 },
]

interface SaveSpotProps {
  onSaved: (spot: Spot) => void
}

export function SaveSpot({ onSaved }: SaveSpotProps) {
  const { fix, error, supported } = useGeolocation()
  const [manual, setManual] = useState<LatLng | null>(null)
  const [floor, setFloor] = useState('')
  const [bay, setBay] = useState('')
  const [note, setNote] = useState('')
  const [timer, setTimer] = useState(0)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const position: LatLng | null = manual ?? (fix ? { lat: fix.lat, lng: fix.lng } : null)
  const accuracy = manual ? 0 : (fix?.accuracy ?? 0)

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhoto(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhoto(null)
    setPhotoUrl(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  const save = () => {
    if (!position) return
    onSaved({
      id: crypto.randomUUID(),
      lat: position.lat,
      lng: position.lng,
      accuracy,
      savedAt: Date.now(),
      floor: floor.trim(),
      bay: bay.trim(),
      note: note.trim(),
      photo: photo ?? undefined,
      expiresAt: timer ? Date.now() + timer * 60_000 : undefined,
    })
  }

  return (
    <section className="panel">
      <div className="status-row">
        <span className={`dot ${position ? 'ok' : 'wait'}`} />
        {position ? (
          <span>
            {manual
              ? 'Location picked on map'
              : `GPS locked · ±${Math.round(accuracy)} m accuracy`}
          </span>
        ) : (
          <span>{supported ? 'Getting your location…' : 'Geolocation not supported'}</span>
        )}
      </div>

      {error && !manual && (
        <p className="warn">
          {error}. Tap the map below to drop your parking pin manually.
        </p>
      )}

      <MapView car={position} onPick={setManual} className="map map-save" />

      <div className="field-row">
        <label className="field">
          <span>Floor / level</span>
          <input
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="B2"
            inputMode="text"
          />
        </label>
        <label className="field">
          <span>Bay / slot</span>
          <input value={bay} onChange={(e) => setBay(e.target.value)} placeholder="H-142" />
        </label>
      </div>

      <label className="field">
        <span>Note</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Near the blue lift, opposite the food court"
        />
      </label>

      <div className="field">
        <span>Parking timer</span>
        <div className="chips">
          {TIMER_OPTIONS.map((option) => (
            <button
              key={option.minutes}
              type="button"
              className={`chip ${timer === option.minutes ? 'chip-on' : ''}`}
              onClick={() => setTimer(option.minutes)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>Photo</span>
        {photoUrl ? (
          <div className="photo-preview">
            <img src={photoUrl} alt="Parking spot" />
            <button type="button" className="btn btn-ghost" onClick={clearPhoto}>
              Remove photo
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fileInput.current?.click()}
          >
            📷 Add a photo of the spot
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoChange}
          hidden
        />
      </div>

      <button type="button" className="btn btn-primary btn-big" disabled={!position} onClick={save}>
        Save my parking spot
      </button>
    </section>
  )
}
