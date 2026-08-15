import type { Spot } from '../db'
import { directionsUrl } from '../geo'

interface HistoryProps {
  spots: Spot[]
  onDelete: (id: string) => void
}

export function History({ spots, onDelete }: HistoryProps) {
  if (spots.length === 0) {
    return (
      <section className="panel">
        <p className="empty">No past parking spots yet.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <ul className="history">
        {spots.map((spot) => (
          <li key={spot.id}>
            <div>
              <strong>{new Date(spot.savedAt).toLocaleString()}</strong>
              <span className="muted">
                {[spot.floor && `Floor ${spot.floor}`, spot.bay && `Bay ${spot.bay}`, spot.note]
                  .filter(Boolean)
                  .join(' · ') || `${spot.lat.toFixed(5)}, ${spot.lng.toFixed(5)}`}
              </span>
            </div>
            <div className="history-actions">
              <a
                className="btn btn-ghost btn-small"
                href={directionsUrl({ lat: spot.lat, lng: spot.lng })}
                target="_blank"
                rel="noreferrer"
              >
                Map
              </a>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => onDelete(spot.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
