import { useEffect } from 'react';
import { CircleMarker, useMap } from 'react-leaflet';
import type { UserPresence } from '@/types/index';

interface Props {
  runners: UserPresence[];
  currentUserId: string;
}

export function CommunityMapLayer({ runners, currentUserId }: Props) {
  const map = useMap();

  useEffect(() => {
    // Il layer si aggiorna automaticamente tramite re-render dei CircleMarker
    void map;
  }, [map]);

  return (
    <>
      {runners
        .filter((r) => r.user_id !== currentUserId && r.condivisione !== 'nessuno')
        .map((runner) => (
          <CircleMarker
            key={runner.user_id}
            center={[runner.lat, runner.lng]}
            radius={8}
            pathOptions={{
              color: '#31E981',
              fillColor: '#31E981',
              fillOpacity: runner.stato === 'corsa' ? 0.9 : 0.4,
              weight: 2,
            }}
          />
        ))}
    </>
  );
}
