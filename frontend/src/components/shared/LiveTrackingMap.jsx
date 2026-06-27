import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function AnimatedMarker({ position, icon, popupTitle, popupBody }) {
  const [currentPosition, setCurrentPosition] = useState(position || [24.8607, 67.0011]);

  useEffect(() => {
    if (!position) return;

    const from = currentPosition;
    const to = position;
    const startTime = performance.now();
    const duration = Math.max(400, Math.min(1000, Math.hypot(to[0] - from[0], to[1] - from[1]) * 5000));

    let frameId;
    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextLat = from[0] + (to[0] - from[0]) * eased;
      const nextLng = from[1] + (to[1] - from[1]) * eased;
      setCurrentPosition([nextLat, nextLng]);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [position?.[0], position?.[1]]);

  return (
    <Marker position={currentPosition} icon={icon}>
      <Popup>
        <strong>{popupTitle}</strong>
        {popupBody ? <><br />{popupBody}</> : null}
      </Popup>
    </Marker>
  );
}

export default function LiveTrackingMap({
  customerLocation,
  workerLocation,
  role = 'customer',
  onRouteInfo,
  height = '380px',
  initialCenter = [24.8607, 67.0011],
  compact = false
}) {
  const normalizePosition = (location) => {
    if (!location || typeof location !== 'object') return null;

    const lat = location.latitude ?? location.lat ?? location.latitute ?? location?.coordinates?.[1] ?? location?.location?.latitude ?? location?.location?.lat;
    const lng = location.longitude ?? location.lng ?? location.lon ?? location?.coordinates?.[0] ?? location?.location?.longitude ?? location?.location?.lng;

    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      return null;
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return null;
    }

    return [parsedLat, parsedLng];
  };
  const workerIcon = useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 32px; height: 32px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }), []);

  const customerIcon = useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: linear-gradient(135deg, #ff6b00, #e05e00); width: 32px; height: 32px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }), []);

  const workerPosition = useMemo(() => normalizePosition(workerLocation), [workerLocation]);
  const customerPosition = useMemo(() => normalizePosition(customerLocation), [customerLocation]);

  const mapCenter = useMemo(() => {
    if (workerPosition && customerPosition) {
      return [
        (workerPosition[0] + customerPosition[0]) / 2,
        (workerPosition[1] + customerPosition[1]) / 2
      ];
    }
    if (workerPosition) return workerPosition;
    if (customerPosition) return customerPosition;
    return initialCenter;
  }, [workerPosition, customerPosition, initialCenter]);

  const mapBounds = useMemo(() => {
    if (workerPosition && customerPosition) {
      return L.latLngBounds(workerPosition, customerPosition);
    }
    return null;
  }, [workerPosition, customerPosition]);

  return (
    <div style={{ height, width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-grey)', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        bounds={mapBounds || undefined}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {customerPosition && (
          <AnimatedMarker
            position={customerPosition}
            icon={customerIcon}
            popupTitle={role === 'worker' ? 'Customer Location' : 'Your Location'}
            popupBody={role === 'worker' ? 'Customer destination' : 'Your pickup point'}
          />
        )}

        {workerPosition && (
          <AnimatedMarker
            position={workerPosition}
            icon={workerIcon}
            popupTitle={role === 'worker' ? 'Your Location' : 'Worker Location'}
            popupBody={role === 'worker' ? 'Live GPS tracking' : 'Driver is on the way'}
          />
        )}

      </MapContainer>
    </div>
  );
}
