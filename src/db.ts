import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface Spot {
  id: string
  lat: number
  lng: number
  accuracy: number
  savedAt: number
  floor: string
  bay: string
  note: string
  photo?: Blob
  /** epoch ms when the parking meter expires, if a timer was set */
  expiresAt?: number
}

interface ParkSpotDB extends DBSchema {
  spots: {
    key: string
    value: Spot
    indexes: { savedAt: number }
  }
}

let dbPromise: Promise<IDBPDatabase<ParkSpotDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ParkSpotDB>('parkspot', 1, {
      upgrade(db) {
        const store = db.createObjectStore('spots', { keyPath: 'id' })
        store.createIndex('savedAt', 'savedAt')
      },
    })
  }
  return dbPromise
}

export async function putSpot(spot: Spot): Promise<void> {
  const db = await getDB()
  await db.put('spots', spot)
}

export async function deleteSpot(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('spots', id)
}

/** Newest first. */
export async function listSpots(): Promise<Spot[]> {
  const db = await getDB()
  const spots = await db.getAllFromIndex('spots', 'savedAt')
  return spots.reverse()
}
