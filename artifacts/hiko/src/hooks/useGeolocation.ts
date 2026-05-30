import { useState, useEffect } from 'react';

export type GeoError = 'denied' | 'unavailable' | 'timeout' | 'unsupported' | null;

export function useGeolocation(enabled: boolean): { pos: [number, number] | null; error: GeoError } {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [error, setError] = useState<GeoError>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setError('unsupported');
      return;
    }
    setError(null);
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setError(null);
        setPos([coords.latitude, coords.longitude]);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setError('denied');
        else if (err.code === err.POSITION_UNAVAILABLE) setError('unavailable');
        else setError('timeout');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { pos, error };
}
