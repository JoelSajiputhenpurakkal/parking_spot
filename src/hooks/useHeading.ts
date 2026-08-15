import { useCallback, useEffect, useState } from 'react'

interface WebkitOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

type PermissionRequester = { requestPermission: () => Promise<PermissionState> }

function needsPermission(): boolean {
  const ctor = window.DeviceOrientationEvent as unknown as Partial<PermissionRequester>
  return typeof ctor?.requestPermission === 'function'
}

/**
 * Device compass heading in degrees clockwise from north, or null when the
 * device has no magnetometer or permission was not granted.
 */
export function useHeading() {
  const [heading, setHeading] = useState<number | null>(null)
  const [granted, setGranted] = useState(!needsPermission())

  useEffect(() => {
    if (!granted) return
    const onOrientation = (event: DeviceOrientationEvent) => {
      const e = event as WebkitOrientationEvent
      if (typeof e.webkitCompassHeading === 'number') {
        setHeading(e.webkitCompassHeading)
      } else if (e.absolute && typeof e.alpha === 'number') {
        setHeading((360 - e.alpha) % 360)
      }
    }
    window.addEventListener('deviceorientationabsolute', onOrientation)
    window.addEventListener('deviceorientation', onOrientation)
    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrientation)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [granted])

  const requestAccess = useCallback(async () => {
    if (!needsPermission()) {
      setGranted(true)
      return
    }
    const ctor = window.DeviceOrientationEvent as unknown as PermissionRequester
    const result = await ctor.requestPermission()
    setGranted(result === 'granted')
  }, [])

  return { heading, granted, requestAccess, needsPermission: needsPermission() }
}
