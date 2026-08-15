import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LatLng } from '../geo'

const carIcon = L.divIcon({
  className: 'pin pin-car',
  html: '<span>🚗</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

const meIcon = L.divIcon({
  className: 'pin pin-me',
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function Recenter({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], Math.max(map.getZoom(), 18))
      return
    }
    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [48, 48], maxZoom: 19 },
    )
  }, [map, points])
  return null
}

function ClickHandler({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

interface MapViewProps {
  car?: LatLng | null
  me?: LatLng | null
  onPick?: (point: LatLng) => void
  className?: string
}

export function MapView({ car, me, onPick, className }: MapViewProps) {
  const points = [car, me].filter((p): p is LatLng => Boolean(p))
  const center = points[0] ?? { lat: 20, lng: 0 }

  return (
    <MapContainer
      className={className ?? 'map'}
      center={[center.lat, center.lng]}
      zoom={points.length ? 18 : 2}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {car && <Marker position={[car.lat, car.lng]} icon={carIcon} />}
      {me && <Marker position={[me.lat, me.lng]} icon={meIcon} />}
      {car && me && (
        <Polyline
          positions={[
            [me.lat, me.lng],
            [car.lat, car.lng],
          ]}
          pathOptions={{ color: '#2dd4bf', dashArray: '6 8', weight: 3 }}
        />
      )}
      <Recenter points={points} />
      {onPick && <ClickHandler onPick={onPick} />}
    </MapContainer>
  )
}
