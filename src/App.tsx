import { useCallback, useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { deleteSpot, listSpots, putSpot, type Spot } from './db'
import { SaveSpot } from './components/SaveSpot'
import { FindCar } from './components/FindCar'
import { History } from './components/History'

type Tab = 'park' | 'find' | 'history'

export default function App() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<Tab>('park')

  useEffect(() => {
    listSpots().then((stored) => {
      setSpots(stored)
      setLoaded(true)
      if (stored.length > 0) setTab('find')
    })
  }, [])

  const active = spots[0] ?? null

  const handleSaved = useCallback(async (spot: Spot) => {
    await putSpot(spot)
    setSpots((current) => [spot, ...current])
    setTab('find')
    if (spot.expiresAt && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    await deleteSpot(id)
    setSpots((current) => current.filter((spot) => spot.id !== id))
  }, [])

  const handleFound = useCallback(async () => {
    if (!active) return
    await handleDelete(active.id)
    setTab('park')
  }, [active, handleDelete])

  return (
    <div className="app">
      <header className="header">
        <h1>ParkSpot</h1>
        <p>Save where you parked. Walk straight back to it.</p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={tab === 'park' ? 'tab tab-on' : 'tab'}
          onClick={() => setTab('park')}
        >
          Park
        </button>
        <button
          type="button"
          className={tab === 'find' ? 'tab tab-on' : 'tab'}
          onClick={() => setTab('find')}
        >
          Find my car
        </button>
        <button
          type="button"
          className={tab === 'history' ? 'tab tab-on' : 'tab'}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </nav>

      {!loaded && <section className="panel"><p className="empty">Loading…</p></section>}

      {loaded && tab === 'park' && <SaveSpot onSaved={handleSaved} />}
      {loaded && tab === 'find' &&
        (active ? (
          <FindCar spot={active} onFound={handleFound} />
        ) : (
          <section className="panel">
            <p className="empty">No car saved yet — park one first.</p>
          </section>
        ))}
      {loaded && tab === 'history' && <History spots={spots.slice(1)} onDelete={handleDelete} />}

      <footer className="footer">Works offline · your spots never leave this device</footer>
    </div>
  )
}
